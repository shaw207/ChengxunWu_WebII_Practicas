// src/config/db.js
import mongoose from 'mongoose';

const dbConnect = async () => {
  const uri = process.env.DB_URI;
  if (!uri) {
    throw new Error('La variable de entorno DB_URI no está definida');
  }

  try {
    console.log("DB_URI_RUNTIME =", process.env.DB_URI);
if (process.env.DB_URI?.includes("nnet")) throw new Error("DB_URI contiene 'nnet' (typo).");
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 10000 });
    console.log('✅ Conectado a MongoDB');
  } catch (err) {
    console.warn('⚠️ Error conectando a MongoDB:', err.message);

    if (process.env.NODE_ENV === 'development') {
      console.log('💡 Continuando sin BD en modo desarrollo (API devolverá 503 si se usa DB)...');
      return;
    }

    throw err;
  }

  mongoose.connection.on('disconnected', () => {
    console.warn('⚠️ Desconectado de MongoDB');
  });

  process.on('SIGINT', async () => {
    await mongoose.connection.close();
    console.log('🔌 Conexión a MongoDB cerrada');
    process.exit(0);
  });
};

export default dbConnect;