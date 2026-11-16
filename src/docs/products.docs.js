import { PRODUCT_STATUS } from '../constants/index.js';

/**
 * Documentación OpenAPI de los endpoints del módulo Products (/api/products).
 */
export const productsPaths = {
  '/api/products': {
    get: {
      tags: ['Products'],
      summary: 'Obtener catálogo de productos',
      description: 'Devuelve el listado de productos con soporte de filtros por categoría, estado o disponibilidad en stock.',
      parameters: [
        {
          name: 'category',
          in: 'query',
          required: false,
          description: 'Filtrar por categoría de producto',
          schema: { type: 'string', example: 'embalaje' },
        },
        {
          name: 'status',
          in: 'query',
          required: false,
          description: 'Filtrar por estado de inventario permitido',
          schema: { type: 'string', enum: Object.values(PRODUCT_STATUS) },
        },
        {
          name: 'onlyInStock',
          in: 'query',
          required: false,
          description: 'Si es "true", devuelve solo productos con stock > 0 y estado AVAILABLE',
          schema: { type: 'string', enum: ['true', 'false'] },
        },
      ],
      responses: {
        200: {
          description: 'Listado de productos obtenido exitosamente',
          content: {
            'application/json': {
              schema: {
                allOf: [
                  { $ref: '#/components/schemas/SuccessResponse' },
                  {
                    type: 'object',
                    properties: {
                      data: {
                        type: 'array',
                        items: { $ref: '#/components/schemas/Product' },
                      },
                    },
                  },
                ],
              },
            },
          },
        },
        400: { $ref: '#/components/responses/BadRequestError' },
        500: { $ref: '#/components/responses/InternalServerError' },
      },
    },
    post: {
      tags: ['Products'],
      summary: 'Crear un nuevo producto en inventario',
      description: 'Crea un producto calculando automáticamente su estado según el stock inicial.',
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/ProductInput' },
          },
        },
      },
      responses: {
        201: {
          description: 'Producto creado exitosamente',
          content: {
            'application/json': {
              schema: {
                allOf: [
                  { $ref: '#/components/schemas/SuccessResponse' },
                  {
                    type: 'object',
                    properties: {
                      data: { $ref: '#/components/schemas/Product' },
                    },
                  },
                ],
              },
            },
          },
        },
        400: { $ref: '#/components/responses/BadRequestError' },
        500: { $ref: '#/components/responses/InternalServerError' },
      },
    },
  },

  '/api/products/{id}': {
    get: {
      tags: ['Products'],
      summary: 'Obtener un producto por su ID',
      description: 'Devuelve un producto por su ObjectId.',
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          description: 'ObjectId del producto',
          schema: { type: 'string', example: '65f1a2b3c4d5e6f7a8b9c0d5' },
        },
      ],
      responses: {
        200: {
          description: 'Producto encontrado exitosamente',
          content: {
            'application/json': {
              schema: {
                allOf: [
                  { $ref: '#/components/schemas/SuccessResponse' },
                  {
                    type: 'object',
                    properties: {
                      data: { $ref: '#/components/schemas/Product' },
                    },
                  },
                ],
              },
            },
          },
        },
        400: { $ref: '#/components/responses/BadRequestError' },
        404: { $ref: '#/components/responses/NotFoundError' },
        500: { $ref: '#/components/responses/InternalServerError' },
      },
    },
    put: {
      tags: ['Products'],
      summary: 'Actualizar un producto existente',
      description: 'Actualiza los datos de un producto y recalcula su estado si cambia el stock.',
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          description: 'ObjectId del producto a actualizar',
          schema: { type: 'string', example: '65f1a2b3c4d5e6f7a8b9c0d5' },
        },
      ],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/ProductInput' },
          },
        },
      },
      responses: {
        200: {
          description: 'Producto actualizado exitosamente',
          content: {
            'application/json': {
              schema: {
                allOf: [
                  { $ref: '#/components/schemas/SuccessResponse' },
                  {
                    type: 'object',
                    properties: {
                      data: { $ref: '#/components/schemas/Product' },
                    },
                  },
                ],
              },
            },
          },
        },
        400: { $ref: '#/components/responses/BadRequestError' },
        404: { $ref: '#/components/responses/NotFoundError' },
        500: { $ref: '#/components/responses/InternalServerError' },
      },
    },
    delete: {
      tags: ['Products'],
      summary: 'Eliminar un producto por su ID',
      description: 'Elimina un producto del catálogo.',
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          description: 'ObjectId del producto a eliminar',
          schema: { type: 'string', example: '65f1a2b3c4d5e6f7a8b9c0d5' },
        },
      ],
      responses: {
        200: {
          description: 'Producto eliminado exitosamente',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/SuccessResponse' },
            },
          },
        },
        400: { $ref: '#/components/responses/BadRequestError' },
        404: { $ref: '#/components/responses/NotFoundError' },
        500: { $ref: '#/components/responses/InternalServerError' },
      },
    },
  },
};
