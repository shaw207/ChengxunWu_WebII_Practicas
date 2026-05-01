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

const clientSchema = new mongoose.Schema(
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
    name: {
      type: String,
      required: [true, 'El nombre es obligatorio'],
      trim: true,
      index: true
    },
    cif: {
      type: String,
      required: [true, 'El CIF es obligatorio'],
      uppercase: true,
      trim: true
    },
    email: {
      type: String,
      lowercase: true,
      trim: true,
      default: null
    },
    phone: {
      type: String,
      trim: true,
      default: null
    },
    address: {
      type: addressSchema,
      default: () => ({})
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

clientSchema.index({ company: 1, cif: 1 }, { unique: true });
clientSchema.plugin(softDeletePlugin);

const Client = mongoose.model('Client', clientSchema);

export default Client;
