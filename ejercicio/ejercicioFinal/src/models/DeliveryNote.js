import mongoose from 'mongoose';
import { softDeletePlugin } from '../plugins/softDelete.plugin.js';

const workerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'El nombre del trabajador es obligatorio'],
      trim: true
    },
    hours: {
      type: Number,
      required: [true, 'Las horas son obligatorias'],
      min: [0.1, 'Las horas deben ser positivas']
    }
  },
  { _id: false }
);

const deliveryNoteSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'El usuario es obligatorio'],
      index: true
    },
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: [true, 'La compania es obligatoria'],
      index: true
    },
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Client',
      required: [true, 'El cliente es obligatorio'],
      index: true
    },
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: [true, 'El proyecto es obligatorio'],
      index: true
    },
    format: {
      type: String,
      enum: ['material', 'hours'],
      required: [true, 'El formato es obligatorio'],
      index: true
    },
    description: {
      type: String,
      required: [true, 'La descripcion es obligatoria'],
      trim: true
    },
    workDate: {
      type: Date,
      required: [true, 'La fecha de trabajo es obligatoria'],
      index: true
    },
    material: {
      type: String,
      trim: true,
      default: null
    },
    quantity: {
      type: Number,
      min: [0, 'La cantidad no puede ser negativa'],
      default: null
    },
    unit: {
      type: String,
      trim: true,
      default: null
    },
    hours: {
      type: Number,
      min: [0, 'Las horas no pueden ser negativas'],
      default: null
    },
    workers: {
      type: [workerSchema],
      default: []
    },
    signed: {
      type: Boolean,
      default: false,
      index: true
    },
    signedAt: {
      type: Date,
      default: null
    },
    signatureUrl: {
      type: String,
      default: null
    },
    pdfUrl: {
      type: String,
      default: null
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

deliveryNoteSchema.plugin(softDeletePlugin);

const DeliveryNote = mongoose.model('DeliveryNote', deliveryNoteSchema);

export default DeliveryNote;
