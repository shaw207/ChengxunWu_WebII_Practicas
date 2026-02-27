// src/models/movie.model.js
import mongoose from 'mongoose';

const movieSchema = new mongoose.Schema(
  {
    title: { type: String, required: [true, 'El título es requerido'], trim: true },
    director: { type: String, required: [true, 'El director es requerido'], trim: true },
    year: { type: Number, required: [true, 'El año es requerido'], min: [1888, 'Año no válido'] },
    genre: { type: String, default: null, trim: true },

    copies: { type: Number, default: 5, min: 0 },
    availableCopies: { type: Number, default: 5, min: 0 },
    timesRented: { type: Number, default: 0, min: 0 },

    // nombre de archivo guardado por multer
    cover: { type: String, default: null }
  },
  { timestamps: true, versionKey: false }
);

// índices útiles
movieSchema.index({ title: 1 });
movieSchema.index({ genre: 1 });
movieSchema.index({ timesRented: -1 });

export default mongoose.model('Movie', movieSchema);