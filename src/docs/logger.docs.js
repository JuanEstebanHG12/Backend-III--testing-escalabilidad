/**
 * Documentación OpenAPI del endpoint de verificación del Logger (/api/loggerTest y /loggerTest).
 */
export const loggerPaths = {
  '/api/loggerTest': {
    get: {
      tags: ['Logger'],
      summary: 'Probar todos los niveles del sistema de logging (Herramienta interna de validación)',
      description:
        '**IMPORTANTE**: Este endpoint **no representa una funcionalidad real de negocio**, sino una **herramienta interna de validación y monitoreo** para comprobar que Winston emite correctamente los 6 niveles (`debug`, `http`, `info`, `warning`, `error` y `fatal`) en consola y persiste únicamente `error` y `fatal` en `/logs/error.log` y en los archivos rotados diariamente.',
      responses: {
        200: {
          description: 'Prueba de los 6 niveles del logger ejecutada correctamente',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/LoggerTestResponse' },
            },
          },
        },
        500: { $ref: '#/components/responses/InternalServerError' },
      },
    },
  },
};
