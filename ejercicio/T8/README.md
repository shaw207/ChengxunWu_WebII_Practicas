# T8 - Documentaci贸n, Testing y Monitorizaci贸n

Proyecto que integra Swagger, Jest y notificaciones a Slack.

## Caracter铆sticas

- **Swagger**: Documentaci贸n interactiva en `/api-docs`
- **Jest + Supertest**: Tests automatizados
- **Slack Webhooks**: Notificaci贸n de errores en tiempo real

## Instalaci贸n

```bash
npm install
cp .env.example .env
# Editar .env con tus credenciales
npm run dev
```

## Endpoints

### Documentaci贸n
| M茅todo | Ruta | Descripci贸n |
|--------|------|-------------|
| GET | `/api-docs` | Swagger UI |

### Auth
| M茅todo | Ruta | Auth | Descripci贸n |
|--------|------|------|-------------|
| POST | `/api/auth/register` | No | Registrar usuario |
| POST | `/api/auth/login` | No | Iniciar sesi贸n |
| GET | `/api/auth/me` | S铆 | Obtener perfil |

### Podcasts
| M茅todo | Ruta | Auth | Rol | Descripci贸n |
|--------|------|------|-----|-------------|
| GET | `/api/podcasts` | No | - | Listar podcasts |
| GET | `/api/podcasts/:id` | No | - | Obtener podcast |
| POST | `/api/podcasts` | S铆 | user/admin | Crear podcast |
| PUT | `/api/podcasts/:id` | S铆 | user/admin | Actualizar podcast |
| DELETE | `/api/podcasts/:id` | S铆 | admin | Eliminar podcast |

## Testing

```bash
# Ejecutar todos los tests
npm test

# Watch mode
npm run test:watch

# Cobertura
npm run test:coverage
```

## Variables de Entorno

| Variable | Descripci贸n |
|----------|-------------|
| PORT | Puerto del servidor (default: 3000) |
| DB_URI | URI de MongoDB |
| JWT_SECRET | Clave secreta para JWT |
| JWT_EXPIRES_IN | Expiraci贸n del token (default: 2h) |
| SLACK_WEBHOOK | URL del webhook de Slack |
