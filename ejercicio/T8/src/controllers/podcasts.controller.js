import Podcast from '../models/podcast.model.js';
import { handleHttpError } from '../utils/handleError.js';

const podcastPopulate = {
  path: 'author',
  select: 'name email'
};

// GET /api/podcasts
export const getPodcasts = async (req, res) => {
  try {
    const podcasts = await Podcast.find({ published: true })
      .populate(podcastPopulate)
      .sort({ createdAt: -1 });

    return res.status(200).json({ data: podcasts });
  } catch (err) {
    return handleHttpError(res, 'ERROR_GET_PODCASTS');
  }
};

// GET /api/podcasts/:id
export const getPodcast = async (req, res) => {
  try {
    const { id } = req.params;

    const podcast = await Podcast.findById(id).populate(podcastPopulate);

    if (!podcast) {
      return handleHttpError(res, 'PODCAST_NOT_FOUND', 404);
    }

    return res.status(200).json({ data: podcast });
  } catch (err) {
    return handleHttpError(res, 'ERROR_GET_PODCAST');
  }
};

// GET /api/podcasts/admin/all
export const getAllPodcastsAdmin = async (req, res) => {
  try {
    const podcasts = await Podcast.find({})
      .populate(podcastPopulate)
      .sort({ createdAt: -1 });

    return res.status(200).json({ data: podcasts });
  } catch (err) {
    return handleHttpError(res, 'ERROR_GET_PODCASTS');
  }
};

// POST /api/podcasts
export const createPodcast = async (req, res) => {
  try {
    const podcast = await Podcast.create({
      ...req.body,
      author: req.user._id,
      published: false
    });

    await podcast.populate(podcastPopulate);

    return res.status(201).json({ data: podcast });
  } catch (err) {
    return handleHttpError(res, 'ERROR_CREATE_PODCAST');
  }
};

// PUT /api/podcasts/:id
export const updatePodcast = async (req, res) => {
  try {
    const { id } = req.params;

    const podcast = await Podcast.findById(id);

    if (!podcast) {
      return handleHttpError(res, 'PODCAST_NOT_FOUND', 404);
    }

    if (String(podcast.author) !== String(req.user._id)) {
      return handleHttpError(res, 'NOT_ALLOWED', 403);
    }

    Object.assign(podcast, req.body);
    await podcast.save();
    await podcast.populate(podcastPopulate);

    return res.status(200).json({ data: podcast });
  } catch (err) {
    return handleHttpError(res, 'ERROR_UPDATE_PODCAST');
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

    return res.status(200).json({
      message: 'Podcast eliminado',
      data: podcast
    });
  } catch (err) {
    return handleHttpError(res, 'ERROR_DELETE_PODCAST');
  }
};

// PATCH /api/podcasts/:id/publish
export const publishPodcast = async (req, res) => {
  try {
    const { id } = req.params;

    const podcast = await Podcast.findById(id);

    if (!podcast) {
      return handleHttpError(res, 'PODCAST_NOT_FOUND', 404);
    }

    podcast.published = typeof req.body.published === 'boolean'
      ? req.body.published
      : !podcast.published;

    await podcast.save();
    await podcast.populate(podcastPopulate);

    return res.status(200).json({ data: podcast });
  } catch (err) {
    return handleHttpError(res, 'ERROR_UPDATE_PODCAST');
  }
};
