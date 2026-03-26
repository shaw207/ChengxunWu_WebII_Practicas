import app from './app.js';
import dbConnect from './config/db.js';

const PORT = process.env.PORT || 3000;

dbConnect().then(() => {
  app.listen(PORT, () => {
    console.log(`馃殌 Servidor en http://localhost:${PORT}`);
    console.log(`馃摎 Docs en http://localhost:${PORT}/api-docs`);
  });
});
