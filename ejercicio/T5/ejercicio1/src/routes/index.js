// src/routes/index.js
import { Router } from 'express';
import { readdirSync } from 'node:fs';

const router = Router();
const __dirname = import.meta.dirname;

// cargar todos los routers que terminen en .routes.js
const files = readdirSync(__dirname).filter(f => f.endsWith('.routes.js'));
for (const file of files) {
  const name = file.replace('.routes.js', '');
  const route = await import(`./${file}`);
  router.use(`/${name}`, route.default);
  console.log(`📍 Ruta cargada: /api/${name}`);
}

router.get('/', (req, res) => {
  res.json({ mensaje: 'API Tema 5', endpoints: files.map(f => `/${f.replace('.routes.js','')}`) });
});

export default router;
