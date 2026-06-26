const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const http = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const movieRoutes = require('./routes/movies');
const hallRoutes = require('./routes/halls');
const showtimeRoutes = require('./routes/showtimes');
const bookingRoutes = require('./routes/bookings');
const seatRoutes = require('./routes/seats');
const aiRoutes = require('./routes/ai');
const adminRoutes = require('./routes/admin');
const { sendBookingConfirmation } = require('./services/emailService');

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: process.env.CLIENT_URL || 'http://localhost:5173', credentials: true }
});

app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173', credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(cookieParser());

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/cinematch')
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

app.use('/api/auth', authRoutes);
app.use('/api/movies', movieRoutes);
app.use('/api/halls', hallRoutes);
app.use('/api/showtimes', showtimeRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/seats', seatRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/admin', adminRoutes);

const seatHolds = new Map();
const HOLD_TIMEOUT = 3 * 60 * 1000;

io.on('connection', (socket) => {
  socket.on('join-showtime', (showtimeId) => {
    socket.join(`showtime:${showtimeId}`);
    socket.showtimeId = showtimeId;
  });

  socket.on('hold-seat', async ({ showtimeId, seat }) => {
    const key = `${showtimeId}:${seat}`;
    if (seatHolds.has(key)) {
      socket.emit('seat-error', { seat, message: 'Seat is already held' });
      return;
    }
    seatHolds.set(key, { socketId: socket.id, timeout: setTimeout(() => {
      seatHolds.delete(key);
      io.to(`showtime:${showtimeId}`).emit('seat-released', { seat });
    }, HOLD_TIMEOUT) });
    socket.to(`showtime:${showtimeId}`).emit('seat-held', { seat, heldBy: socket.id });
  });

  socket.on('release-seat', ({ showtimeId, seat }) => {
    const key = `${showtimeId}:${seat}`;
    if (seatHolds.has(key) && seatHolds.get(key).socketId === socket.id) {
      clearTimeout(seatHolds.get(key).timeout);
      seatHolds.delete(key);
      io.to(`showtime:${showtimeId}`).emit('seat-released', { seat });
    }
  });

  socket.on('booking-confirmed', async ({ showtimeId, seats, booking }) => {
    seats.forEach(seat => {
      const key = `${showtimeId}:${seat}`;
      if (seatHolds.has(key)) {
        clearTimeout(seatHolds.get(key).timeout);
        seatHolds.delete(key);
      }
    });
    io.to(`showtime:${showtimeId}`).emit('seats-booked', { seats });

    try {
      const Booking = require('./models/Booking');
      const fullBooking = await Booking.findById(booking._id)
        .populate({ path: 'showtime', populate: { path: 'movie hall' } });
      if (fullBooking) {
        const User = require('./models/User');
        const user = await User.findById(fullBooking.user);
        if (user) {
          await sendBookingConfirmation(user.email, {
            movieTitle: fullBooking.showtime.movie.title,
            date: fullBooking.showtime.date,
            time: fullBooking.showtime.time,
            seats: fullBooking.seats,
            totalPrice: fullBooking.totalPrice,
            qrCode: fullBooking.qrCode
          });
        }
      }
    } catch (err) {
      console.error('Email notification error:', err.message);
    }
  });

  socket.on('disconnect', () => {
    for (const [key, value] of seatHolds.entries()) {
      if (value.socketId === socket.id) {
        clearTimeout(value.timeout);
        seatHolds.delete(key);
        const [showtimeId, seat] = key.split(':');
        if (showtimeId && seat) {
          io.to(`showtime:${showtimeId}`).emit('seat-released', { seat });
        }
      }
    }
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
