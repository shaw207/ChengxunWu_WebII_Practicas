import Podcast from '../models/podcast.model.js';
import { handleHttpError } from '../utils/handleError.js';

// GET /api/podcasts
export const getPodcasts = async (req, res) => {
  try {
    const podcasts = await Podcast.find({}).populate('artist', 'name email');
    res.json({ data: podcasts });
  } catch (err) {
    handleHttpError(res, 'ERROR_GET_PODCASTS');
  }
};

// GET /api/podcasts/:id
export const getPodcast = async (req, res) => {
  try {
    const { id } = req.params;
    const podcast = await Podcast.findById(id).populate('artist', 'name email');

    if (!podcast) {
      return handleHttpError(res, 'PODCAST_NOT_FOUND', 404);
    }

    res.json({ data: podcast });
  } catch (err) {
    handleHttpError(res, 'ERROR_GET_PODCAST');
  }
};

// POST /api/podcasts
export const createPodcast = async (req, res) => {
  try {
    const body = {
      ...req.body,
      artist: req.user._id
    };

    const podcast = await Podcast.create(body);
    res.status(201).json({ data: podcast });
  } catch (err) {
    handleHttpError(res, 'ERROR_CREATE_PODCAST');
  }
};

// PUT /api/podcasts/:id
export const updatePodcast = async (req, res) => {
  try {
    const { id } = req.params;

    const podcast = await Podcast.findByIdAndUpdate(id, req.body, { new: true });

    if (!podcast) {
      return handleHttpError(res, 'PODCAST_NOT_FOUND', 404);
    }

    res.json({ data: podcast });
  } catch (err) {
    handleHttpError(res, 'ERROR_UPDATE_PODCAST');
  }
};

// DELETE /api/podcasts/:id
export const deletePodcast = async (req, res) => {
  try {
    const { id } = req.params;

    const podcast = await Podcast.findByIdAndDelete(id);

    if (!podcast) {
      return handleHttpError(res, 'PODCAST_NOT_FOUND', 404);
    }

    res.json({ message: 'Podcast eliminado', data: podcast });
  } catch (err) {
    handleHttpError(res, 'ERROR_DELETE_PODCAST');
  }
};
