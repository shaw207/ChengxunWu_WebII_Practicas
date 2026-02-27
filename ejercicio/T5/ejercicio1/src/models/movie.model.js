// src/models/movie.model.js
import mongoose from 'mongoose';

const currentYear = new Date().getFullYear();

const movieSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, minlength: 2 },
    director: { type: String, required: true },
    year: { type: Number, required: true, min: 1888, max: currentYear },
    genre: { type: String, enum: ['action', 'comedy', 'drama', 'horror', 'scifi'] },
    copies: { type: Number, default: 5, min: 0 },
    availableCopies: { type: Number, min: 0 },
    timesRented: { type: Number, default: 0, min: 0 },
    cover: { type: String, default: null }
  },
  { timestamps: true }
);


movieSchema.pre('save', function (next) {
  if (this.isNew && (this.availableCopies === undefined || this.availableCopies === null)) {
    this.availableCopies = this.copies;
  }
  next();
});

movieSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.__v;
  return obj;
};

export default mongoose.model('Movie', movieSchema);