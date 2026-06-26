const express = require('express');
const QRCode = require('qrcode');
const Booking = require('../models/Booking');
const Showtime = require('../models/Showtime');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.post('/', protect, async (req, res) => {
  try {
    const { showtimeId, seats } = req.body;
    const showtime = await Showtime.findById(showtimeId).populate('movie', 'title').populate('hall', 'name');
    if (!showtime) return res.status(404).json({ message: 'Showtime not found' });

    for (const seat of seats) {
      if (!showtime.availableSeats.includes(seat)) {
        return res.status(400).json({ message: `Seat ${seat} is not available` });
      }
    }

    const totalPrice = showtime.price * seats.length;
    showtime.availableSeats = showtime.availableSeats.filter(s => !seats.includes(s));
    showtime.lockedSeats = showtime.lockedSeats.filter(s => !seats.includes(s));
    await showtime.save();

    const booking = await Booking.create({
      user: req.user._id,
      showtime: showtimeId,
      seats,
      totalPrice,
      status: 'confirmed'
    });

    const qrData = JSON.stringify({ bookingId: booking._id, seats, movie: showtime.movie.title, date: showtime.date, time: showtime.time });
    const qrCode = await QRCode.toDataURL(qrData);
    booking.qrCode = qrCode;
    await booking.save();

    await User.findByIdAndUpdate(req.user._id, {
      $push: { watchHistory: showtime.movie._id }
    });

    res.status(201).json(booking);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

router.get('/me', protect, async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user._id })
      .populate({ path: 'showtime', populate: { path: 'movie', select: 'title poster genre duration' } })
      .sort({ createdAt: -1 });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

router.get('/:id', protect, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate({ path: 'showtime', populate: { path: 'movie hall' } });
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    if (booking.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }
    res.json(booking);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
