const express = require('express');
const Hall = require('../models/Hall');
const { protect, admin } = require('../middleware/auth');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const halls = await Hall.find().sort({ name: 1 });
    res.json(halls);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

router.post('/', protect, admin, async (req, res) => {
  try {
    const hall = await Hall.create(req.body);
    res.status(201).json(hall);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

router.put('/:id', protect, admin, async (req, res) => {
  try {
    const hall = await Hall.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!hall) return res.status(404).json({ message: 'Hall not found' });
    res.json(hall);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

router.delete('/:id', protect, admin, async (req, res) => {
  try {
    const hall = await Hall.findByIdAndDelete(req.params.id);
    if (!hall) return res.status(404).json({ message: 'Hall not found' });
    res.json({ message: 'Hall deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
