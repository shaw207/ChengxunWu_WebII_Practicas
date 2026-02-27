// src/models/movie.model.js
import mongoose from 'mongoose';

const currentYear = new Date().getFullYear();

const movieSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'El titulo es requerido'],
      trim: true,
      minlength: [2, 'El titulo debe tener al menos 2 caracteres']
    },
    director: {
      type: String,
      required: [true, 'El director es requerido'],
      trim: true
    },
    year: {
      type: Number,
      required: [true, 'El anio es requerido'],
      min: [1888, 'Anio no valido'],
      max: [currentYear, `El anio no puede ser mayor a ${currentYear}`]
    },
    genre: {
      type: String,
      required: [true, 'El genero es requerido'],
      enum: {
        values: ['action', 'comedy', 'drama', 'horror', 'scifi'],
        message: 'Genero no valido'
      },
      trim: true,
      lowercase: true
    },
    copies: { type: Number, default: 5, min: 0 },
    availableCopies: { type: Number, default: 5, min: 0 },
    timesRented: { type: Number, default: 0, min: 0 },
    cover: { type: String, default: null }
  },
  { timestamps: true, versionKey: false }
);

movieSchema.index({ title: 1 });
movieSchema.index({ genre: 1 });
movieSchema.index({ timesRented: -1 });

export default mongoose.model('Movie', movieSchema);