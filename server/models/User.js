const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  watchHistory: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Movie' }],
  preferredGenres: { type: [String], default: [] },
  ratings: [{
    movie: { type: mongoose.Schema.Types.ObjectId, ref: 'Movie' },
    score: { type: Number, min: 1, max: 5 }
  }]
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
