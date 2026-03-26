import mongoose from 'mongoose';

const dbConnect = async () => {
  const databaseUri = process.env.MONGODB_URI || process.env.DB_URI;

  try {
    await mongoose.connect(databaseUri);
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error.message);
    process.exit(1);
  }
};

export default dbConnect;
