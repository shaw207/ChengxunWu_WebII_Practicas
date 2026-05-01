import mongoose from 'mongoose';
import { softDeletePlugin } from '../plugins/softDelete.plugin.js';

const addressSchema = new mongoose.Schema(
  {
    street: { type: String, trim: true, default: null },
    number: { type: String, trim: true, default: null },
    postal: { type: String, trim: true, default: null },
    city: { type: String, trim: true, default: null },
    province: { type: String, trim: true, default: null }
  },
  { _id: false }
);

const projectSchema = new mongoose.Schema(
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
    name: {
      type: String,
      required: [true, 'El nombre es obligatorio'],
      trim: true,
      index: true
    },
    projectCode: {
      type: String,
      required: [true, 'El codigo del proyecto es obligatorio'],
      trim: true,
      uppercase: true
    },
    address: {
      type: addressSchema,
      default: () => ({})
    },
    email: {
      type: String,
      lowercase: true,
      trim: true,
      default: null
    },
    notes: {
      type: String,
      trim: true,
      default: null
    },
    active: {
      type: Boolean,
      default: true,
      index: true
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

projectSchema.index({ company: 1, projectCode: 1 }, { unique: true });
projectSchema.plugin(softDeletePlugin);

const Project = mongoose.model('Project', projectSchema);

export default Project;
