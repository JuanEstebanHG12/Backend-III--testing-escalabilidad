import { ORDER_STATUS, ORDER_PRIORITY, RECEIPT_TYPES } from '../constants/index.js';

/**
 * Documentación OpenAPI de los endpoints del módulo Orders (/api/orders).
 */
export const ordersPaths = {
  '/api/orders': {
    get: {
      tags: ['Orders'],
      summary: 'Obtener listado de pedidos',
      description:
        'Devuelve todos los pedidos registrados con el cliente poblado. Permite filtrar por estado o prioridad válidos.',
      parameters: [
        {
          name: 'estado',
          in: 'query',
          required: false,
          description: 'Filtrar pedidos por estado permitido',
          schema: {
            type: 'string',
            enum: Object.values(ORDER_STATUS),
          },
        },
        {
          name: 'prioridad',
          in: 'query',
          required: false,
          description: 'Filtrar pedidos por nivel de prioridad permitido',
          schema: {
            type: 'string',
            enum: Object.values(ORDER_PRIORITY),
          },
        },
      ],
      responses: {
        200: {
          description: 'Listado de pedidos obtenido exitosamente',
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
                        items: { $ref: '#/components/schemas/Order' },
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
      tags: ['Orders'],
      summary: 'Crear un nuevo pedido',
      description:
        'Registra un nuevo pedido verificando que el usuario cliente exista, que el total e ítems no tengan valores negativos y que el estado/prioridad sean válidos.',
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/OrderInput' },
          },
        },
      },
      responses: {
        201: {
          description: 'Pedido creado exitosamente',
          content: {
            'application/json': {
              schema: {
                allOf: [
                  { $ref: '#/components/schemas/SuccessResponse' },
                  {
                    type: 'object',
                    properties: {
                      data: { $ref: '#/components/schemas/Order' },
                    },
                  },
                ],
              },
            },
          },
        },
        400: { $ref: '#/components/responses/BadRequestError' },
        404: { $ref: '#/components/responses/NotFoundError' },
        409: { $ref: '#/components/responses/ConflictError' },
        500: { $ref: '#/components/responses/InternalServerError' },
      },
    },
  },

  '/api/orders/{id}': {
    get: {
      tags: ['Orders'],
      summary: 'Obtener un pedido por su ID',
      description: 'Devuelve el detalle de un pedido por su ObjectId. Lanza OrderNotFoundError (404) si no existe.',
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          description: 'ObjectId del pedido a consultar',
          schema: { type: 'string', example: '65f1a2b3c4d5e6f7a8b9c0d2' },
        },
      ],
      responses: {
        200: {
          description: 'Pedido encontrado exitosamente',
          content: {
            'application/json': {
              schema: {
                allOf: [
                  { $ref: '#/components/schemas/SuccessResponse' },
                  {
                    type: 'object',
                    properties: {
                      data: { $ref: '#/components/schemas/Order' },
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
      tags: ['Orders'],
      summary: 'Actualizar datos de un pedido existente',
      description: 'Actualiza descripción, ítems, total, dirección, estado o prioridad de un pedido.',
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          description: 'ObjectId del pedido a actualizar',
          schema: { type: 'string', example: '65f1a2b3c4d5e6f7a8b9c0d2' },
        },
      ],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/OrderUpdateInput' },
          },
        },
      },
      responses: {
        200: {
          description: 'Pedido actualizado exitosamente',
          content: {
            'application/json': {
              schema: {
                allOf: [
                  { $ref: '#/components/schemas/SuccessResponse' },
                  {
                    type: 'object',
                    properties: {
                      data: { $ref: '#/components/schemas/Order' },
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
      tags: ['Orders'],
      summary: 'Eliminar un pedido por su ID',
      description: 'Elimina un pedido existente de la base de datos.',
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          description: 'ObjectId del pedido a eliminar',
          schema: { type: 'string', example: '65f1a2b3c4d5e6f7a8b9c0d2' },
        },
      ],
      responses: {
        200: {
          description: 'Pedido eliminado exitosamente',
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

  '/api/orders/{id}/status': {
    patch: {
      tags: ['Orders'],
      summary: 'Actualizar el estado de un pedido',
      description:
        'Modifica el estado de un pedido validando que el nuevo valor pertenezca a ORDER_STATUS (pendiente, en_preparacion, enviado, entregado, cancelado).',
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          description: 'ObjectId del pedido',
          schema: { type: 'string', example: '65f1a2b3c4d5e6f7a8b9c0d2' },
        },
      ],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/OrderStatusInput' },
          },
        },
      },
      responses: {
        200: {
          description: 'Estado del pedido actualizado exitosamente',
          content: {
            'application/json': {
              schema: {
                allOf: [
                  { $ref: '#/components/schemas/SuccessResponse' },
                  {
                    type: 'object',
                    properties: {
                      data: { $ref: '#/components/schemas/Order' },
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
  },

  '/api/orders/{id}/receipt': {
    post: {
      tags: ['Orders'],
      summary: 'Subir un comprobante asociado a un pedido (multipart/form-data)',
      description:
        'Recibe un archivo de comprobante vía multipart/form-data y lo asocia al pedido indicado. Verifica que el pedido exista, valida el tipo y tamaño del archivo (máx. 5 MB), lo almacena en uploads/receipts y registra los metadatos en la entidad pedido.',
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          description: 'ObjectId del pedido al que se asociará el comprobante',
          schema: { type: 'string', example: '65f1a2b3c4d5e6f7a8b9c0d2' },
        },
      ],
      requestBody: {
        required: true,
        content: {
          'multipart/form-data': {
            schema: {
              type: 'object',
              required: ['file'],
              properties: {
                file: {
                  type: 'string',
                  format: 'binary',
                  description:
                    'Archivo de comprobante (campo "file", también acepta alias "receipt" o "comprobante"). Formatos aceptados: PDF, JPG, JPEG, PNG, WEBP. Tamaño máximo: 5 MB.',
                },
                documentType: {
                  type: 'string',
                  enum: Object.values(RECEIPT_TYPES),
                  default: RECEIPT_TYPES.COMPROBANTE_PAGO,
                  example: RECEIPT_TYPES.COMPROBANTE_PAGO,
                  description:
                    'Tipo de comprobante opcional (también acepta alias "tipoDocumento"). Opciones permitidas: comprobante_pago, comprobante_entrega, factura, remito.',
                },
              },
            },
          },
        },
      },
      responses: {
        201: {
          description: 'Comprobante subido y asociado exitosamente al pedido',
          content: {
            'application/json': {
              schema: {
                allOf: [
                  { $ref: '#/components/schemas/SuccessResponse' },
                  {
                    type: 'object',
                    properties: {
                      data: { $ref: '#/components/schemas/Order' },
                      receipt: { $ref: '#/components/schemas/FileMetadata' },
                    },
                  },
                ],
              },
            },
          },
        },
        400: { $ref: '#/components/responses/FileUploadBadRequestError' },
        404: { $ref: '#/components/responses/NotFoundError' },
        500: { $ref: '#/components/responses/InternalServerError' },
      },
    },
  },
};
