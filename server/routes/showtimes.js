const express = require('express');
const Showtime = require('../models/Showtime');
const Hall = require('../models/Hall');
const { protect, admin } = require('../middleware/auth');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { movieId, date } = req.query;
    const filter = {};
    if (movieId) filter.movie = movieId;
    if (date) {
      const d = new Date(date);
      filter.date = { $gte: new Date(d.setHours(0,0,0)), $lte: new Date(d.setHours(23,59,59)) };
    }
    const showtimes = await Showtime.find(filter)
      .populate('movie', 'title poster duration genre rating')
      .populate('hall', 'name rows columns')
      .sort({ date: 1, time: 1 });
    res.json(showtimes);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const showtime = await Showtime.findById(req.params.id)
      .populate('movie', 'title poster duration genre rating description')
      .populate('hall', 'name rows columns seats');
    if (!showtime) return res.status(404).json({ message: 'Showtime not found' });
    res.json(showtime);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

router.post('/', protect, admin, async (req, res) => {
  try {
    const hall = await Hall.findById(req.body.hall);
    if (!hall) return res.status(404).json({ message: 'Hall not found' });
    const allSeats = hall.seats.flat();
    const showtime = await Showtime.create({ ...req.body, availableSeats: allSeats });
    res.status(201).json(showtime);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

router.put('/:id', protect, admin, async (req, res) => {
  try {
    const showtime = await Showtime.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!showtime) return res.status(404).json({ message: 'Showtime not found' });
    res.json(showtime);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

router.delete('/:id', protect, admin, async (req, res) => {
  try {
    const showtime = await Showtime.findByIdAndDelete(req.params.id);
    if (!showtime) return res.status(404).json({ message: 'Showtime not found' });
    res.json({ message: 'Showtime deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
