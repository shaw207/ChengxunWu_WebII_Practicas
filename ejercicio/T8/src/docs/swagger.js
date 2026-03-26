import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.3',
    info: {
      title: 'PodcastHub API',
      version: '1.0.0',
      description: 'API REST para gestionar podcasts con autenticación JWT, roles y documentación Swagger.'
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Servidor de desarrollo'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '65f8b3a2c9d1e20012345678' },
            name: { type: 'string', example: 'Ana Perez' },
            email: { type: 'string', format: 'email', example: 'ana@example.com' },
            role: { type: 'string', enum: ['user', 'admin'], example: 'user' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        Podcast: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '65f8b3a2c9d1e20012345679' },
            title: { type: 'string', example: 'Historia de la Web' },
            description: { type: 'string', example: 'Un repaso largo y claro sobre la evolución de Internet.' },
            author: {
              oneOf: [
                { type: 'string', example: '65f8b3a2c9d1e20012345678' },
                { $ref: '#/components/schemas/User' }
              ]
            },
            category: {
              type: 'string',
              enum: ['tech', 'science', 'history', 'comedy', 'news'],
              example: 'tech'
            },
            duration: { type: 'integer', example: 1800 },
            episodes: { type: 'integer', example: 12 },
            published: { type: 'boolean', example: false },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        AuthResponse: {
          type: 'object',
          properties: {
            token: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
            user: { $ref: '#/components/schemas/User' }
          }
        },
        Error: {
          type: 'object',
          properties: {
            error: { type: 'boolean', example: true },
            message: { type: 'string', example: 'INVALID_CREDENTIALS' }
          }
        },
        RegisterRequest: {
          type: 'object',
          required: ['name', 'email', 'password'],
          properties: {
            name: { type: 'string', example: 'Ana Perez' },
            email: { type: 'string', format: 'email', example: 'ana@example.com' },
            password: { type: 'string', format: 'password', example: 'SuperPass123' }
          }
        },
        LoginRequest: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: { type: 'string', format: 'email', example: 'ana@example.com' },
            password: { type: 'string', format: 'password', example: 'SuperPass123' }
          }
        },
        CreatePodcastRequest: {
          type: 'object',
          required: ['title', 'description', 'category', 'duration'],
          properties: {
            title: { type: 'string', example: 'Historia de la Web' },
            description: { type: 'string', example: 'Un repaso largo y claro sobre la evolución de Internet.' },
            category: {
              type: 'string',
              enum: ['tech', 'science', 'history', 'comedy', 'news'],
              example: 'history'
            },
            duration: { type: 'integer', example: 1800 },
            episodes: { type: 'integer', example: 8 }
          }
        },
        UpdatePodcastRequest: {
          type: 'object',
          properties: {
            title: { type: 'string', example: 'Historia moderna de la Web' },
            description: { type: 'string', example: 'Versión revisada con más contexto.' },
            category: {
              type: 'string',
              enum: ['tech', 'science', 'history', 'comedy', 'news'],
              example: 'tech'
            },
            duration: { type: 'integer', example: 2100 },
            episodes: { type: 'integer', example: 10 }
          }
        },
        PublishPodcastRequest: {
          type: 'object',
          properties: {
            published: { type: 'boolean', example: true }
          }
        }
      }
    }
  },
  apis: ['./src/routes/*.js']
};

export default swaggerJsdoc(options);
