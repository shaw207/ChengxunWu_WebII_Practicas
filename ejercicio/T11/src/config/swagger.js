import swaggerUi from 'swagger-ui-express';

const spec = {
  openapi: '3.0.3',
  info: {
    title: 'Library API',
    version: '1.0.0',
    description: 'API REST para biblioteca con Express y Prisma',
  },
  servers: [
    {
      url: 'http://localhost:3000',
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
    schemas: {
      AuthRegister: {
        type: 'object',
        required: ['name', 'email', 'password'],
        properties: {
          name: { type: 'string' },
          email: { type: 'string', format: 'email' },
          password: { type: 'string', minLength: 8 },
        },
      },
      AuthLogin: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', format: 'email' },
          password: { type: 'string', minLength: 8 },
        },
      },
      BookInput: {
        type: 'object',
        required: ['isbn', 'title', 'author', 'genre', 'publishedYear', 'copies'],
        properties: {
          isbn: { type: 'string' },
          title: { type: 'string' },
          author: { type: 'string' },
          genre: { type: 'string' },
          description: { type: 'string', nullable: true },
          publishedYear: { type: 'integer' },
          copies: { type: 'integer' },
          available: { type: 'integer' },
        },
      },
      LoanInput: {
        type: 'object',
        required: ['bookId'],
        properties: {
          bookId: { type: 'integer' },
        },
      },
      ReviewInput: {
        type: 'object',
        required: ['rating'],
        properties: {
          rating: { type: 'integer', minimum: 1, maximum: 5 },
          comment: { type: 'string', nullable: true },
        },
      },
    },
  },
  paths: {
    '/health': {
      get: {
        summary: 'Health check',
        responses: {
          200: { description: 'API disponible' },
        },
      },
    },
    '/api/auth/register': {
      post: {
        summary: 'Registrar usuario',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/AuthRegister' },
            },
          },
        },
        responses: {
          201: { description: 'Usuario registrado' },
        },
      },
    },
    '/api/auth/login': {
      post: {
        summary: 'Iniciar sesión',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/AuthLogin' },
            },
          },
        },
        responses: {
          200: { description: 'Sesión iniciada' },
        },
      },
    },
    '/api/auth/me': {
      get: {
        summary: 'Perfil autenticado',
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'Perfil' },
          401: { description: 'No autenticado' },
        },
      },
    },
    '/api/books': {
      get: {
        summary: 'Listar libros',
        parameters: [
          { in: 'query', name: 'search', schema: { type: 'string' } },
          { in: 'query', name: 'author', schema: { type: 'string' } },
          { in: 'query', name: 'genre', schema: { type: 'string' } },
          { in: 'query', name: 'available', schema: { type: 'boolean' } },
          { in: 'query', name: 'page', schema: { type: 'integer' } },
          { in: 'query', name: 'limit', schema: { type: 'integer' } },
        ],
        responses: {
          200: { description: 'Listado de libros' },
        },
      },
      post: {
        summary: 'Crear libro',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/BookInput' },
            },
          },
        },
        responses: {
          201: { description: 'Libro creado' },
          403: { description: 'Sin permisos' },
        },
      },
    },
    '/api/books/stats': {
      get: {
        summary: 'Estadísticas de libros',
        security: [{ bearerAuth: [] }],
        parameters: [
          { in: 'query', name: 'limit', schema: { type: 'integer' } },
        ],
        responses: {
          200: { description: 'Estadísticas' },
          403: { description: 'Sin permisos' },
        },
      },
    },
    '/api/books/{id}': {
      get: {
        summary: 'Obtener libro por ID',
        parameters: [
          { in: 'path', name: 'id', required: true, schema: { type: 'integer' } },
        ],
        responses: {
          200: { description: 'Libro' },
          404: { description: 'No encontrado' },
        },
      },
      put: {
        summary: 'Actualizar libro',
        security: [{ bearerAuth: [] }],
        parameters: [
          { in: 'path', name: 'id', required: true, schema: { type: 'integer' } },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/BookInput' },
            },
          },
        },
        responses: {
          200: { description: 'Libro actualizado' },
        },
      },
      delete: {
        summary: 'Eliminar libro',
        security: [{ bearerAuth: [] }],
        parameters: [
          { in: 'path', name: 'id', required: true, schema: { type: 'integer' } },
        ],
        responses: {
          200: { description: 'Libro eliminado' },
        },
      },
    },
    '/api/loans': {
      get: {
        summary: 'Mis préstamos',
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'Préstamos del usuario' },
        },
      },
      post: {
        summary: 'Solicitar préstamo',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/LoanInput' },
            },
          },
        },
        responses: {
          201: { description: 'Préstamo creado' },
        },
      },
    },
    '/api/loans/all': {
      get: {
        summary: 'Todos los préstamos',
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'Listado global' },
        },
      },
    },
    '/api/loans/{id}/return': {
      put: {
        summary: 'Devolver libro',
        security: [{ bearerAuth: [] }],
        parameters: [
          { in: 'path', name: 'id', required: true, schema: { type: 'integer' } },
        ],
        responses: {
          200: { description: 'Préstamo devuelto' },
        },
      },
    },
    '/api/books/{id}/reviews': {
      get: {
        summary: 'Reseñas por libro',
        parameters: [
          { in: 'path', name: 'id', required: true, schema: { type: 'integer' } },
        ],
        responses: {
          200: { description: 'Reseñas' },
        },
      },
      post: {
        summary: 'Crear reseña',
        security: [{ bearerAuth: [] }],
        parameters: [
          { in: 'path', name: 'id', required: true, schema: { type: 'integer' } },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ReviewInput' },
            },
          },
        },
        responses: {
          201: { description: 'Reseña creada' },
        },
      },
    },
    '/api/reviews/{id}': {
      delete: {
        summary: 'Eliminar reseña propia',
        security: [{ bearerAuth: [] }],
        parameters: [
          { in: 'path', name: 'id', required: true, schema: { type: 'integer' } },
        ],
        responses: {
          200: { description: 'Reseña eliminada' },
        },
      },
    },
  },
};

export const swaggerUiServe = swaggerUi.serve;
export const swaggerUiSetup = swaggerUi.setup(spec);
export const swaggerDocument = spec;
