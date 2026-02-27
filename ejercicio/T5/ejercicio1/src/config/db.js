// src/config/db.js
import mongoose from 'mongoose';

const dbConnect = async () => {
  const uri = process.env.DB_URI;
  if (!uri) {
    throw new Error('La variable de entorno DB_URI no está definida');
  }

  await mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  mongoose.connection.on('disconnected', () => {
    console.warn('⚠️ Desconectado de MongoDB');
  });

  process.on('SIGINT', async () => {
    await mongoose.connection.close();
    console.log('Conexión Mongo cerrada por SIGINT');
    process.exit(0);
  });
};

export default dbConnect;
