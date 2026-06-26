const express = require('express');
const Booking = require('../models/Booking');
const Showtime = require('../models/Showtime');
const Movie = require('../models/Movie');
const User = require('../models/User');
const { protect, admin } = require('../middleware/auth');

const router = express.Router();

router.get('/stats', protect, admin, async (req, res) => {
  try {
    const totalMovies = await Movie.countDocuments({ isActive: true });
    const totalBookings = await Booking.countDocuments({ status: 'confirmed' });
    const totalUsers = await User.countDocuments({ role: 'user' });
    const totalRevenue = await Booking.aggregate([
      { $match: { status: 'confirmed' } },
      { $group: { _id: null, total: { $sum: '$totalPrice' } } }
    ]);

    const topMovies = await Booking.aggregate([
      { $match: { status: 'confirmed' } },
      { $lookup: { from: 'showtimes', localField: 'showtime', foreignField: '_id', as: 'showtime' } },
      { $unwind: '$showtime' },
      { $lookup: { from: 'movies', localField: 'showtime.movie', foreignField: '_id', as: 'movie' } },
      { $unwind: '$movie' },
      { $group: { _id: '$movie._id', title: { $first: '$movie.title' }, bookings: { $sum: 1 } } },
      { $sort: { bookings: -1 } },
      { $limit: 10 }
    ]);

    const seatUtilization = await Showtime.aggregate([
      { $lookup: { from: 'halls', localField: 'hall', foreignField: '_id', as: 'hall' } },
      { $unwind: '$hall' },
      { $project: {
        hallName: '$hall.name',
        totalSeats: { $size: { $arrayElemAt: ['$hall.seats', 0] } },
        availableCount: { $size: '$availableSeats' },
        movie: 1
      }}
    ]);

    res.json({
      totalMovies,
      totalBookings,
      totalUsers,
      totalRevenue: totalRevenue.length > 0 ? totalRevenue[0].total : 0,
      topMovies,
      seatUtilization
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
