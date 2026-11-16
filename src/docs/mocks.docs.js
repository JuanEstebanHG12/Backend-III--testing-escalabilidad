/**
 * Documentación OpenAPI de los endpoints del módulo Mocks (/api/mocks).
 */
export const mocksPaths = {
  '/api/mocks/users': {
    get: {
      tags: ['Mocks'],
      summary: 'Generar usuarios simulados en memoria (sin persistir en MongoDB)',
      description:
        'Genera un lote de usuarios simulados (clientes y repartidores) usando @faker-js/faker. Si se envía una cantidad negativa devuelve 400 (NEGATIVE_VALUE); si es 0, texto, decimal o > 1000 devuelve 400 (INVALID_MOCK_QUANTITY).',
      parameters: [
        {
          name: 'qty',
          in: 'query',
          required: false,
          description: 'Cantidad de usuarios a simular (entero positivo entre 1 y 1000; por defecto 10)',
          schema: { type: 'integer', minimum: 1, maximum: 1000, default: 10, example: 2 },
        },
      ],
      responses: {
        200: {
          description: 'Lista de usuarios simulados en memoria',
          content: {
            'application/json': {
              schema: {
                type: 'array',
                items: { $ref: '#/components/schemas/MockUser' },
              },
            },
          },
        },
        400: { $ref: '#/components/responses/MockBadRequestError' },
        500: { $ref: '#/components/responses/InternalServerError' },
      },
    },
  },

  '/api/mocks/orders': {
    get: {
      tags: ['Mocks'],
      summary: 'Generar pedidos simulados en memoria (sin persistir en MongoDB)',
      description:
        'Genera pedidos simulados en memoria con código, cliente, ítems, total, estado y prioridad válidos según las constantes del dominio.',
      parameters: [
        {
          name: 'qty',
          in: 'query',
          required: false,
          description: 'Cantidad de pedidos a simular (entero positivo entre 1 y 1000; por defecto 10)',
          schema: { type: 'integer', minimum: 1, maximum: 1000, default: 10, example: 5 },
        },
      ],
      responses: {
        200: {
          description: 'Lista de pedidos simulados en memoria',
          content: {
            'application/json': {
              schema: {
                type: 'array',
                items: { $ref: '#/components/schemas/Order' },
              },
            },
          },
        },
        400: { $ref: '#/components/responses/MockBadRequestError' },
        500: { $ref: '#/components/responses/InternalServerError' },
      },
    },
  },

  '/api/mocks/deliveries': {
    get: {
      tags: ['Mocks'],
      summary: 'Generar entregas simuladas en memoria (sin persistir en MongoDB)',
      description:
        'Genera entregas logísticas simuladas con código de seguimiento, pedido, repartidor, estado y fecha estimada.',
      parameters: [
        {
          name: 'qty',
          in: 'query',
          required: false,
          description: 'Cantidad de entregas a simular (entero positivo entre 1 y 1000; por defecto 10)',
          schema: { type: 'integer', minimum: 1, maximum: 1000, default: 10, example: 5 },
        },
      ],
      responses: {
        200: {
          description: 'Lista de entregas simuladas en memoria',
          content: {
            'application/json': {
              schema: {
                type: 'array',
                items: { $ref: '#/components/schemas/Delivery' },
              },
            },
          },
        },
        400: { $ref: '#/components/responses/MockBadRequestError' },
        500: { $ref: '#/components/responses/InternalServerError' },
      },
    },
  },

  '/api/mocks/all': {
    get: {
      tags: ['Mocks'],
      summary: 'Generar ecosistema completo simulado en memoria',
      description:
        'Devuelve simultáneamente usuarios, pedidos y entregas simuladas en memoria con relaciones coherentes.',
      parameters: [
        {
          name: 'qty',
          in: 'query',
          required: false,
          description: 'Cantidad de registros por colección (entero positivo entre 1 y 1000; por defecto 10)',
          schema: { type: 'integer', minimum: 1, maximum: 1000, default: 10, example: 5 },
        },
      ],
      responses: {
        200: {
          description: 'Ecosistema completo simulado en memoria',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/MockAllResponse' },
            },
          },
        },
        400: { $ref: '#/components/responses/MockBadRequestError' },
        500: { $ref: '#/components/responses/InternalServerError' },
      },
    },
  },

  '/api/mocks/seed': {
    post: {
      tags: ['Mocks'],
      summary: 'Insertar datos de prueba simulados en MongoDB',
      description:
        'Genera e inserta registros de prueba en MongoDB respetando las relaciones entre entidades (usuarios, pedidos, entregas o all). Acepta parámetros tanto por query string como en el body JSON. Valida cantidades inválidas/negativas (400) y controla fallos de persistencia en MongoDB (500 MOCK_SEED_FAILURE).',
      parameters: [
        {
          name: 'qty',
          in: 'query',
          required: false,
          description: 'Cantidad de registros a insertar en MongoDB (por defecto 10, entre 1 y 1000)',
          schema: { type: 'integer', minimum: 1, maximum: 1000, default: 10, example: 10 },
        },
        {
          name: 'collection',
          in: 'query',
          required: false,
          description: 'Colección destino (usuarios, pedidos, entregas, all)',
          schema: {
            type: 'string',
            enum: ['usuarios', 'users', 'pedidos', 'orders', 'entregas', 'deliveries', 'all', 'completo'],
            default: 'usuarios',
          },
        },
      ],
      requestBody: {
        required: false,
        description:
          'Opcionalmente se puede enviar qty y collection en el body JSON (si se envían en query, tienen prioridad los query params)',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/MockSeedInput' },
          },
        },
      },
      responses: {
        201: {
          description: 'Registros simulados insertados exitosamente en MongoDB',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/MockSeedResponse' },
            },
          },
        },
        400: { $ref: '#/components/responses/MockBadRequestError' },
        500: { $ref: '#/components/responses/InternalServerError' },
      },
    },
  },

  '/api/mocks/clear': {
    delete: {
      tags: ['Mocks'],
      summary: 'Limpiar colecciones de prueba en MongoDB',
      description:
        'Elimina los registros de las colecciones de prueba (entregas, pedidos y usuarios) en MongoDB de forma controlada.',
      responses: {
        200: {
          description: 'Colecciones limpiadas exitosamente',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  mensaje: {
                    type: 'string',
                    example: 'Colecciones de prueba (usuarios, pedidos, entregas) limpiadas exitosamente.',
                  },
                },
              },
            },
          },
        },
        500: { $ref: '#/components/responses/InternalServerError' },
      },
    },
  },
};
