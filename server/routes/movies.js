const express = require('express');
const Movie = require('../models/Movie');
const Showtime = require('../models/Showtime');
const Hall = require('../models/Hall');
const { protect, admin } = require('../middleware/auth');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { genre, minRating, maxDuration } = req.query;
    const filter = { isActive: true };
    if (genre) filter.genre = { $in: genre.split(',') };
    if (minRating) filter.rating = { $gte: parseFloat(minRating) };
    if (maxDuration) filter.duration = { $lte: parseInt(maxDuration) };
    const movies = await Movie.find(filter).sort({ title: 1 });
    res.json(movies);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id);
    if (!movie) return res.status(404).json({ message: 'Movie not found' });
    const showtimes = await Showtime.find({ movie: movie._id })
      .populate('hall', 'name rows columns')
      .sort({ date: 1, time: 1 });
    res.json({ movie, showtimes });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

router.post('/', protect, admin, async (req, res) => {
  try {
    const movie = await Movie.create(req.body);
    res.status(201).json(movie);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

router.put('/:id', protect, admin, async (req, res) => {
  try {
    const movie = await Movie.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!movie) return res.status(404).json({ message: 'Movie not found' });
    res.json(movie);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

router.delete('/:id', protect, admin, async (req, res) => {
  try {
    const movie = await Movie.findByIdAndDelete(req.params.id);
    if (!movie) return res.status(404).json({ message: 'Movie not found' });
    res.json({ message: 'Movie deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
