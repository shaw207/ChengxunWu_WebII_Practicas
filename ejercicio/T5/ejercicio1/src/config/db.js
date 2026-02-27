// src/config/db.js
import mongoose from 'mongoose';

const dbConnect = async () => {
  const uri = process.env.DB_URI;
  if (!uri) {
    throw new Error('La variable de entorno DB_URI no está definida');
  }

  // connect without deprecated options (driver v4+ ignores them)
  try {
    await mongoose.connect(uri);
    console.log('✅ Conectado a MongoDB');
  } catch (err) {
    console.warn('⚠️ Error conectando a MongoDB:', err.message);
    console.log('💡 Continuando sin BD en modo desarrollo...');
    // En desarrollo, permitir continuar sin BD para trabajar en código
  }

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
