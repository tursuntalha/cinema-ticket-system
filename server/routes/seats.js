const express = require('express');
const Showtime = require('../models/Showtime');

const router = express.Router();

router.get('/:showtimeId', async (req, res) => {
  try {
    const showtime = await Showtime.findById(req.params.showtimeId)
      .populate('hall', 'name rows columns seats');
    if (!showtime) return res.status(404).json({ message: 'Showtime not found' });
    res.json({
      hall: showtime.hall,
      availableSeats: showtime.availableSeats,
      lockedSeats: showtime.lockedSeats,
      price: showtime.price
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
