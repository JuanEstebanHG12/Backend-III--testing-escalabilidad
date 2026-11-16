import { DELIVERY_STATUS } from '../constants/index.js';

/**
 * Documentación OpenAPI de los endpoints del módulo Deliveries (/api/deliveries).
 */
export const deliveriesPaths = {
  '/api/deliveries': {
    get: {
      tags: ['Deliveries'],
      summary: 'Obtener listado de entregas logísticas',
      description:
        'Devuelve todas las entregas con el pedido y el repartidor poblados. Permite filtrar por estado válido.',
      parameters: [
        {
          name: 'estado',
          in: 'query',
          required: false,
          description: 'Filtrar entregas por estado permitido',
          schema: {
            type: 'string',
            enum: Object.values(DELIVERY_STATUS),
          },
        },
      ],
      responses: {
        200: {
          description: 'Listado de entregas obtenido exitosamente',
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
                        items: { $ref: '#/components/schemas/Delivery' },
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
      tags: ['Deliveries'],
      summary: 'Crear una nueva entrega',
      description:
        'Registra una entrega verificando que el pedido exista, que el usuario asignado exista y posea el rol "repartidor", y que el estado sea válido.',
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/DeliveryInput' },
          },
        },
      },
      responses: {
        201: {
          description: 'Entrega creada exitosamente',
          content: {
            'application/json': {
              schema: {
                allOf: [
                  { $ref: '#/components/schemas/SuccessResponse' },
                  {
                    type: 'object',
                    properties: {
                      data: { $ref: '#/components/schemas/Delivery' },
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

  '/api/deliveries/{id}': {
    get: {
      tags: ['Deliveries'],
      summary: 'Obtener una entrega por su ID',
      description: 'Devuelve el detalle de una entrega con su pedido y repartidor asociados.',
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          description: 'ObjectId de la entrega a consultar',
          schema: { type: 'string', example: '65f1a2b3c4d5e6f7a8b9c0d3' },
        },
      ],
      responses: {
        200: {
          description: 'Entrega encontrada exitosamente',
          content: {
            'application/json': {
              schema: {
                allOf: [
                  { $ref: '#/components/schemas/SuccessResponse' },
                  {
                    type: 'object',
                    properties: {
                      data: { $ref: '#/components/schemas/Delivery' },
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
      tags: ['Deliveries'],
      summary: 'Actualizar una entrega existente',
      description: 'Actualiza el estado, dirección o repartidor asignado de una entrega existente.',
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          description: 'ObjectId de la entrega a actualizar',
          schema: { type: 'string', example: '65f1a2b3c4d5e6f7a8b9c0d3' },
        },
      ],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/DeliveryUpdateInput' },
          },
        },
      },
      responses: {
        200: {
          description: 'Entrega actualizada exitosamente',
          content: {
            'application/json': {
              schema: {
                allOf: [
                  { $ref: '#/components/schemas/SuccessResponse' },
                  {
                    type: 'object',
                    properties: {
                      data: { $ref: '#/components/schemas/Delivery' },
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
      tags: ['Deliveries'],
      summary: 'Eliminar una entrega por su ID',
      description: 'Elimina una entrega existente de la base de datos.',
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          description: 'ObjectId de la entrega a eliminar',
          schema: { type: 'string', example: '65f1a2b3c4d5e6f7a8b9c0d3' },
        },
      ],
      responses: {
        200: {
          description: 'Entrega eliminada exitosamente',
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
