// src/index.js
import app from './app.js';
import dbConnect from './config/db.js';

const PORT = process.env.PORT || 3000;

const start = async () => {
  try {
    await dbConnect();
    app.listen(PORT, () => {
      console.log(`Servidor iniciado en http://localhost:${PORT}`);
      console.log(`Entorno: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (err) {
    console.error('Error arrancando la aplicación:', err);
    process.exit(1);
  }
};

start();
