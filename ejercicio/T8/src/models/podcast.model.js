import mongoose from 'mongoose';

const podcastSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 3
    },
    description: {
      type: String,
      required: true,
      trim: true,
      minlength: 10
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    category: {
      type: String,
      required: true,
      enum: ['tech', 'science', 'history', 'comedy', 'news']
    },
    duration: {
      type: Number,
      required: true,
      min: 60
    },
    episodes: {
      type: Number,
      default: 1,
      min: 1
    },
    published: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

export default mongoose.model('Podcast', podcastSchema);
