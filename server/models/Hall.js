const mongoose = require('mongoose');

const hallSchema = new mongoose.Schema({
  name: { type: String, required: true },
  rows: { type: Number, required: true },
  columns: { type: Number, required: true },
  seats: { type: [[String]], default: [] }
}, { timestamps: true });

hallSchema.pre('save', function(next) {
  if (this.seats.length === 0) {
    const seatLayout = [];
    for (let r = 0; r < this.rows; r++) {
      const row = [];
      const rowLabel = String.fromCharCode(65 + r);
      for (let c = 1; c <= this.columns; c++) {
        row.push(`${rowLabel}${c}`);
      }
      seatLayout.push(row);
    }
    this.seats = seatLayout;
  }
  next();
});

module.exports = mongoose.model('Hall', hallSchema);
