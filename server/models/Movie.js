const mongoose = require('mongoose');

const movieSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  genre: { type: [String], required: true },
  duration: { type: Number, required: true },
  poster: { type: String, default: '' },
  rating: { type: Number, min: 0, max: 10, default: 0 },
  language: { type: String, default: 'Türkçe' },
  releaseDate: { type: Date },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Movie', movieSchema);
