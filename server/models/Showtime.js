const mongoose = require('mongoose');

const showtimeSchema = new mongoose.Schema({
  movie: { type: mongoose.Schema.Types.ObjectId, ref: 'Movie', required: true },
  hall: { type: mongoose.Schema.Types.ObjectId, ref: 'Hall', required: true },
  date: { type: Date, required: true },
  time: { type: String, required: true },
  price: { type: Number, required: true },
  availableSeats: { type: [String], default: [] },
  lockedSeats: { type: [String], default: [] }
}, { timestamps: true });

showtimeSchema.index({ movie: 1, date: 1, time: 1 });

module.exports = mongoose.model('Showtime', showtimeSchema);
