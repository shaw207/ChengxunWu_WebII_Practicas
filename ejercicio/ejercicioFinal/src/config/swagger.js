import swaggerJsdoc from 'swagger-jsdoc';

export const swaggerSpec = swaggerJsdoc({
  definition: {
    openapi: '3.0.3',
    info: {
      title: 'BildyApp API',
      version: '1.0.0',
      description: 'API REST para gestion de usuarios, clientes, proyectos y albaranes.'
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Servidor local'
      }
    ],
    tags: [
      { name: 'Health' },
      { name: 'Users' },
      { name: 'Auth' },
      { name: 'Clients' },
      { name: 'Projects' },
      { name: 'DeliveryNotes' }
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
        Address: {
          type: 'object',
          properties: {
            street: { type: 'string', nullable: true, example: 'Calle Mayor' },
            number: { type: 'string', nullable: true, example: '10' },
            postal: { type: 'string', nullable: true, example: '28013' },
            city: { type: 'string', nullable: true, example: 'Madrid' },
            province: { type: 'string', nullable: true, example: 'Madrid' }
          }
        },
        User: {
          type: 'object',
          properties: {
            id: { type: 'string', example: '65f8b3a2c9d1e20012345678' },
            email: { type: 'string', format: 'email', example: 'ana@bildyapp.test' },
            name: { type: 'string', nullable: true, example: 'Ana' },
            lastName: { type: 'string', nullable: true, example: 'Garcia' },
            nif: { type: 'string', nullable: true, example: '12345678Z' },
            role: { type: 'string', enum: ['admin', 'guest'], example: 'admin' },
            status: { type: 'string', enum: ['pending', 'verified'], example: 'pending' },
            company: { type: 'string', nullable: true, example: '65f8b3a2c9d1e20012345679' }
          }
        },
        Company: {
          type: 'object',
          properties: {
            id: { type: 'string', example: '65f8b3a2c9d1e20012345679' },
            owner: { type: 'string', example: '65f8b3a2c9d1e20012345678' },
            name: { type: 'string', example: 'Construcciones Garcia' },
            cif: { type: 'string', example: 'B12345678' },
            address: { $ref: '#/components/schemas/Address' },
            logoUrl: { type: 'string', nullable: true, example: 'https://res.cloudinary.com/demo/logo.webp' },
            isFreelance: { type: 'boolean', example: false }
          }
        },
        Client: {
          type: 'object',
          properties: {
            id: { type: 'string', example: '65f8b3a2c9d1e20012345680' },
            user: { type: 'string', example: '65f8b3a2c9d1e20012345678' },
            company: { type: 'string', example: '65f8b3a2c9d1e20012345679' },
            name: { type: 'string', example: 'Cliente Norte' },
            cif: { type: 'string', example: 'B87654321' },
            email: { type: 'string', nullable: true, format: 'email', example: 'cliente@example.com' },
            phone: { type: 'string', nullable: true, example: '+34910000000' },
            address: { $ref: '#/components/schemas/Address' },
            deleted: { type: 'boolean', example: false }
          }
        },
        Project: {
          type: 'object',
          properties: {
            id: { type: 'string', example: '65f8b3a2c9d1e20012345681' },
            user: { type: 'string', example: '65f8b3a2c9d1e20012345678' },
            company: { type: 'string', example: '65f8b3a2c9d1e20012345679' },
            client: { type: 'string', example: '65f8b3a2c9d1e20012345680' },
            name: { type: 'string', example: 'Reforma local centro' },
            projectCode: { type: 'string', example: 'PR-001' },
            address: { $ref: '#/components/schemas/Address' },
            email: { type: 'string', nullable: true, format: 'email', example: 'obra@example.com' },
            notes: { type: 'string', nullable: true, example: 'Acceso por puerta lateral' },
            active: { type: 'boolean', example: true },
            deleted: { type: 'boolean', example: false }
          }
        },
        Worker: {
          type: 'object',
          properties: {
            name: { type: 'string', example: 'Operario 1' },
            hours: { type: 'number', example: 4 }
          }
        },
        DeliveryNote: {
          type: 'object',
          properties: {
            id: { type: 'string', example: '65f8b3a2c9d1e20012345682' },
            user: { type: 'string', example: '65f8b3a2c9d1e20012345678' },
            company: { type: 'string', example: '65f8b3a2c9d1e20012345679' },
            client: { type: 'string', example: '65f8b3a2c9d1e20012345680' },
            project: { type: 'string', example: '65f8b3a2c9d1e20012345681' },
            format: { type: 'string', enum: ['material', 'hours'], example: 'hours' },
            description: { type: 'string', example: 'Trabajos de instalacion' },
            workDate: { type: 'string', format: 'date', example: '2026-05-01' },
            material: { type: 'string', nullable: true, example: 'Cable' },
            quantity: { type: 'number', nullable: true, example: 10 },
            unit: { type: 'string', nullable: true, example: 'm' },
            hours: { type: 'number', nullable: true, example: 8 },
            workers: { type: 'array', items: { $ref: '#/components/schemas/Worker' } },
            signed: { type: 'boolean', example: false },
            signatureUrl: { type: 'string', nullable: true, example: 'https://res.cloudinary.com/demo/signature.webp' },
            pdfUrl: { type: 'string', nullable: true, example: 'https://res.cloudinary.com/demo/deliverynote.pdf' },
            deleted: { type: 'boolean', example: false }
          }
        },
        Pagination: {
          type: 'object',
          properties: {
            totalItems: { type: 'integer', example: 25 },
            totalPages: { type: 'integer', example: 3 },
            currentPage: { type: 'integer', example: 1 },
            limit: { type: 'integer', example: 10 }
          }
        },
        Error: {
          type: 'object',
          properties: {
            error: { type: 'boolean', example: true },
            code: { type: 'string', example: 'VALIDATION_ERROR' },
            message: { type: 'string', example: 'Error de validacion' },
            details: { type: 'array', items: { type: 'object' } }
          }
        }
      },
      responses: {
        Unauthorized: {
          description: 'Token ausente o invalido',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' }
            }
          }
        },
        NotFound: {
          description: 'Recurso no encontrado',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' }
            }
          }
        },
        ValidationError: {
          description: 'Error de validacion',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' }
            }
          }
        }
      }
    }
  },
  apis: ['./src/app.js', './src/routes/*.js']
});
