import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

const STATUS_BY_READY_STATE = {
  0: 'disconnected',
  1: 'connected',
  2: 'connecting',
  3: 'disconnecting'
};

export function getDatabaseStatus() {
  return STATUS_BY_READY_STATE[mongoose.connection.readyState] || 'unknown';
}

export async function connectDB() {
  if (!MONGODB_URI) {
    throw new Error('MONGODB_URI is not defined');
  }

  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  await mongoose.connect(MONGODB_URI);
  return mongoose.connection;
}

mongoose.connection.on('disconnected', () => {
  console.warn('MongoDB disconnected');
});

const closeConnection = async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
  }
};

process.once('SIGINT', async () => {
  await closeConnection();
  process.exit(0);
});

process.once('SIGTERM', async () => {
  await closeConnection();
  process.exit(0);
});

export default connectDB;
