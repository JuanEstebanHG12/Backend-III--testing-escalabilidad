/**
 * Documentación OpenAPI de los endpoints del módulo Users (/api/users).
 */
export const usersPaths = {
  '/api/users': {
    get: {
      tags: ['Users'],
      summary: 'Obtener listado de todos los usuarios',
      description: 'Devuelve la lista completa de usuarios registrados en ShipNow (excluyendo contraseñas).',
      responses: {
        200: {
          description: 'Listado de usuarios obtenido exitosamente',
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
                        items: { $ref: '#/components/schemas/User' },
                      },
                    },
                  },
                ],
              },
            },
          },
        },
        500: { $ref: '#/components/responses/InternalServerError' },
      },
    },
    post: {
      tags: ['Users'],
      summary: 'Registrar un nuevo usuario',
      description:
        'Crea un usuario validando campos obligatorios, formato de correo electrónico, unicidad de email y rol permitido.',
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/UserInput' },
          },
        },
      },
      responses: {
        201: {
          description: 'Usuario creado exitosamente',
          content: {
            'application/json': {
              schema: {
                allOf: [
                  { $ref: '#/components/schemas/SuccessResponse' },
                  {
                    type: 'object',
                    properties: {
                      data: { $ref: '#/components/schemas/User' },
                    },
                  },
                ],
              },
            },
          },
        },
        400: { $ref: '#/components/responses/BadRequestError' },
        409: { $ref: '#/components/responses/ConflictError' },
        500: { $ref: '#/components/responses/InternalServerError' },
      },
    },
  },

  '/api/users/{id}': {
    get: {
      tags: ['Users'],
      summary: 'Obtener un usuario por su ID',
      description: 'Busca un usuario por su identificador de MongoDB (ObjectId).',
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          description: 'Identificador hexadecimal de 24 caracteres de MongoDB (ObjectId)',
          schema: { type: 'string', example: '65f1a2b3c4d5e6f7a8b9c0d1' },
        },
      ],
      responses: {
        200: {
          description: 'Usuario encontrado exitosamente',
          content: {
            'application/json': {
              schema: {
                allOf: [
                  { $ref: '#/components/schemas/SuccessResponse' },
                  {
                    type: 'object',
                    properties: {
                      data: { $ref: '#/components/schemas/User' },
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
      tags: ['Users'],
      summary: 'Actualizar datos de un usuario existente',
      description: 'Actualiza el nombre, email o rol de un usuario tras verificar su existencia y validar los datos.',
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          description: 'ObjectId del usuario a actualizar',
          schema: { type: 'string', example: '65f1a2b3c4d5e6f7a8b9c0d1' },
        },
      ],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/UserUpdateInput' },
          },
        },
      },
      responses: {
        200: {
          description: 'Usuario actualizado exitosamente',
          content: {
            'application/json': {
              schema: {
                allOf: [
                  { $ref: '#/components/schemas/SuccessResponse' },
                  {
                    type: 'object',
                    properties: {
                      data: { $ref: '#/components/schemas/User' },
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
    delete: {
      tags: ['Users'],
      summary: 'Eliminar un usuario por su ID',
      description: 'Elimina permanentemente un usuario tras verificar que existe en la base de datos.',
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          description: 'ObjectId del usuario a eliminar',
          schema: { type: 'string', example: '65f1a2b3c4d5e6f7a8b9c0d1' },
        },
      ],
      responses: {
        200: {
          description: 'Usuario eliminado exitosamente',
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
