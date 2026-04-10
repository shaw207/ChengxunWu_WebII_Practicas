import mongoose from 'mongoose';

const roomSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'El nombre de la sala es requerido'],
      unique: true,
      trim: true,
      minlength: [2, 'Minimo 2 caracteres'],
      maxlength: [100, 'Maximo 100 caracteres']
    },
    description: {
      type: String,
      default: '',
      trim: true,
      maxlength: [300, 'Maximo 300 caracteres']
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'El creador de la sala es requerido']
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

roomSchema.index({ name: 1 }, { unique: true });
roomSchema.index({ createdBy: 1, createdAt: -1 });

const Room = mongoose.models.Room || mongoose.model('Room', roomSchema);

export default Room;
