# PodcastHub API

API REST con autenticacion JWT, autorizacion por roles, documentacion Swagger y tests con Jest + Supertest.

## Instalacion

```bash
npm install
cp .env.example .env
# Editar .env con tus credenciales
npm run dev
```

## Endpoints

### Documentacion
| Metodo | Ruta | Descripcion |
|--------|------|-------------|
| GET | `/api-docs` | Swagger UI |

### Auth
| Metodo | Ruta | Acceso | Descripcion |
|--------|------|--------|-------------|
| POST | `/api/auth/register` | Publico | Registro de usuario |
| POST | `/api/auth/login` | Publico | Login, devuelve token |
| GET | `/api/auth/me` | Autenticado | Perfil del usuario actual |

### Podcasts
| Metodo | Ruta | Acceso | Descripcion |
|--------|------|--------|-------------|
| GET | `/api/podcasts` | Publico | Listar podcasts publicados |
| GET | `/api/podcasts/:id` | Publico | Obtener un podcast |
| POST | `/api/podcasts` | Autenticado | Crear podcast |
| PUT | `/api/podcasts/:id` | Autenticado (autor) | Actualizar propio podcast |
| DELETE | `/api/podcasts/:id` | Admin | Eliminar cualquier podcast |
| GET | `/api/podcasts/admin/all` | Admin | Listar todos, incluidos no publicados |
| PATCH | `/api/podcasts/:id/publish` | Admin | Publicar o despublicar |

## Testing

```bash
npm test
npm run test:watch
npm run test:coverage
```

Los tests usan `MONGODB_TEST_URI`. Si la base esta en MongoDB Atlas, la IP actual debe estar permitida en la whitelist del cluster.

## Variables de entorno

| Variable | Descripcion |
|----------|-------------|
| PORT | Puerto del servidor |
| MONGODB_URI | URI de MongoDB para desarrollo |
| MONGODB_TEST_URI | URI de MongoDB para tests |
| JWT_SECRET | Clave secreta para JWT |
| JWT_EXPIRES_IN | Expiracion del token |
| SLACK_WEBHOOK | Webhook de Slack para errores |
