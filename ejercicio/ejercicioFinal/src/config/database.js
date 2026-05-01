import mongoose from 'mongoose';
import { env } from './env.js';

export const connectDatabase = async () => {
  await mongoose.connect(env.MONGODB_URI);
};

export const disconnectDatabase = async () => {
  await mongoose.disconnect();
};

export const getDatabaseStatus = () => {
  return mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
};
