# BildyApp API

API REST para la practica final de Web II. Gestiona usuarios, companias, clientes, proyectos y albaranes con firma, PDF, WebSockets, Swagger, tests, Docker y CI.

## Requisitos

- Node.js 22 o superior
- npm
- MongoDB local o Docker
- Cuenta de Cloudinary para firmar albaranes
- Webhook de Slack opcional para errores 5XX

## Instalacion

```bash
npm install
cp .env.example .env
npm run dev
```

La API queda disponible en:

```text
http://localhost:3000
```

## Variables de entorno

Ver [.env.example](./.env.example). Las variables principales son:

```text
MONGODB_URI
JWT_SECRET
MAIL_HOST
MAIL_USER
MAIL_PASS
CLOUDINARY_CLOUD_NAME
CLOUDINARY_API_KEY
CLOUDINARY_API_SECRET
SLACK_WEBHOOK_URL
```

Las variables de email y Slack son opcionales en desarrollo. Cloudinary es necesario para `PATCH /api/deliverynote/:id/sign`.

## Scripts

```bash
npm run dev
npm start
npm test
npm run test:coverage
```

La cobertura actual supera el 70% requerido.

## Docker

```bash
docker compose up --build
```

El compose levanta:

- API Node.js 22
- MongoDB 7
- healthcheck para MongoDB
- healthcheck HTTP contra `/health`

## Documentacion

Swagger UI:

```text
http://localhost:3000/api-docs
```

Health check:

```text
GET /health
```

Devuelve `status`, `db`, `uptime` y `timestamp`.

## Autenticacion

Los endpoints protegidos usan:

```http
Authorization: Bearer <accessToken>
```

Endpoints base:

- `POST /api/user/register`
- `PUT /api/user/validation`
- `POST /api/user/login`
- `PUT /api/user/register`
- `PATCH /api/user/company`
- `GET /api/user`
- `DELETE /api/user`
- `GET /api/auth/me`
- `PUT /api/auth/me`

## Funcionalidades principales

Clientes:

- CRUD completo
- paginacion
- filtro por nombre
- ordenacion
- archivado y restauracion
- CIF unico por compania

Proyectos:

- CRUD completo
- paginacion
- filtros por cliente, nombre y estado
- archivado y restauracion
- codigo unico por compania

Albaranes:

- creacion de albaranes de materiales u horas
- filtros por proyecto, cliente, formato, firma y fechas
- PDF con PDFKit
- firma con Multer
- optimizacion de firma con Sharp
- subida de firma y PDF firmado a Cloudinary
- bloqueo de borrado si el albaran esta firmado

Tiempo real:

- Socket.IO con JWT
- rooms por compania
- eventos:
  - `client:new`
  - `project:new`
  - `deliverynote:new`
  - `deliverynote:signed`

## Ejemplos HTTP

Los ejemplos estan en:

```text
requests/api.http
```

Usan variables de REST Client para guardar tokens e ids durante el flujo.
