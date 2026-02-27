// src/controllers/movie.controller.js
import mongoose from 'mongoose';
import Movie from '../models/movie.model.js';
import { ApiError } from '../middleware/error.middleware.js';
import { unlink } from 'node:fs/promises';
import { join } from 'node:path';

// 如果 DB 没连上，直接 503（别让 find() buffering / timeout）
const ensureDbConnected = () => {
  // 0=disconnected, 1=connected, 2=connecting, 3=disconnecting
  if (mongoose.connection.readyState !== 1) {
    throw ApiError.serviceUnavailable('Base de datos no conectada');
  }
};

// Helper: eliminar archivo si existe
const deleteFile = async (filename) => {
  if (!filename) return;
  try {
    const filePath = join(process.cwd(), 'storage', filename);
    await unlink(filePath);
  } catch {
    // ignore
  }
};

// GET /api/movies - Listar películas con filtros
export const list = async (req, res, next) => {
  try {
    ensureDbConnected();

    const { genre, search, page = 1, limit = 10 } = req.query;

    const filter = {};
    if (genre) filter.genre = genre;
    if (search) filter.title = new RegExp(search, 'i');

    const pageNum = Math.max(parseInt(page, 10) || 1, 1);
    const limitNum = Math.min(Math.max(parseInt(limit, 10) || 10, 1), 100);
    const skip = (pageNum - 1) * limitNum;

    const [movies, total] = await Promise.all([
      Movie.find(filter).skip(skip).limit(limitNum).exec(),
      Movie.countDocuments(filter)
    ]);

    res.json({
      data: movies,
      pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) }
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/movies/stats/top - Top 5 películas más alquiladas
export const top = async (req, res, next) => {
  try {
    ensureDbConnected();

    const top5 = await Movie.find().sort({ timesRented: -1 }).limit(5).exec();
    res.json(top5);
  } catch (err) {
    next(err);
  }
};

// GET /api/movies/:id - Obtener película por ID
export const getById = async (req, res, next) => {
  try {
    ensureDbConnected();

    const { id } = req.params;
    const movie = await Movie.findById(id);
    if (!movie) throw ApiError.notFound('Película no encontrada');
    res.json(movie);
  } catch (err) {
    next(err);
  }
};

// POST /api/movies - Crear nueva película
export const create = async (req, res, next) => {
  try {
    ensureDbConnected();

    const { title, director, year, genre, copies } = req.body;

    if (!title || !director || !year) {
      throw ApiError.badRequest('title, director y year son requeridos');
    }

    const copiesNum = copies == null ? 5 : Number(copies);
    const movie = new Movie({
      title,
      director,
      year,
      genre,
      copies: copiesNum,
      availableCopies: copiesNum,
      timesRented: 0
    });

    await movie.save();
    res.status(201).json(movie);
  } catch (err) {
    next(err);
  }
};

// PUT /api/movies/:id - Actualizar película
export const update = async (req, res, next) => {
  try {
    ensureDbConnected();

    const { id } = req.params;
    const movie = await Movie.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
    if (!movie) throw ApiError.notFound('Película no encontrada');
    res.json(movie);
  } catch (err) {
    next(err);
  }
};

// DELETE /api/movies/:id - Eliminar película
export const remove = async (req, res, next) => {
  try {
    ensureDbConnected();

    const { id } = req.params;
    const movie = await Movie.findByIdAndDelete(id);
    if (!movie) throw ApiError.notFound('Película no encontrada');

    await deleteFile(movie.cover);

    res.status(204).end();
  } catch (err) {
    next(err);
  }
};

// PATCH /api/movies/:id/rent - Alquilar película
export const rent = async (req, res, next) => {
  try {
    ensureDbConnected();

    const { id } = req.params;

    const movie = await Movie.findOneAndUpdate(
      { _id: id, availableCopies: { $gt: 0 } },
      { $inc: { availableCopies: -1, timesRented: 1 } },
      { new: true }
    );

    if (!movie) {
      const existing = await Movie.findById(id);
      if (!existing) throw ApiError.notFound('Película no encontrada');
      throw ApiError.badRequest('No hay copias disponibles');
    }

    res.json(movie);
  } catch (err) {
    next(err);
  }
};

// PATCH /api/movies/:id/return - Devolver película
export const returnMovie = async (req, res, next) => {
  try {
    ensureDbConnected();

    const { id } = req.params;
    const movie = await Movie.findById(id);
    if (!movie) throw ApiError.notFound('Película no encontrada');

    if (movie.availableCopies < movie.copies) {
      movie.availableCopies += 1;
      await movie.save();
    }

    res.json(movie);
  } catch (err) {
    next(err);
  }
};

// PATCH /api/movies/:id/cover - Subir/reemplazar carátula
export const uploadCover = async (req, res, next) => {
  try {
    ensureDbConnected();

    const { id } = req.params;

    if (!req.file) {
      throw ApiError.badRequest('No file provided');
    }

    const movie = await Movie.findById(id);
    if (!movie) throw ApiError.notFound('Película no encontrada');

    const oldCover = movie.cover;
    movie.cover = req.file.filename;
    await movie.save();

    await deleteFile(oldCover);

    res.json(movie);
  } catch (err) {
    next(err);
  }
};

// GET /api/movies/:id/cover - Obtener imagen de carátula
export const getCover = async (req, res, next) => {
  try {
    ensureDbConnected();

    const { id } = req.params;
    const movie = await Movie.findById(id);
    if (!movie || !movie.cover) throw ApiError.notFound('Carátula no encontrada');

    const filePath = join(process.cwd(), 'storage', movie.cover);
    res.sendFile(filePath);
  } catch (err) {
    next(err);
  }
};