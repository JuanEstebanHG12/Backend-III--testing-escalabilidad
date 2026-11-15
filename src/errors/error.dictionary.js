/**
 * Diccionario centralizado de errores del dominio de ShipNow API.
 * Cada entrada define un código único, el código de estado HTTP correspondiente
 * y un mensaje por defecto claro y consistente.
 */
export const ERROR_DICTIONARY = Object.freeze({
  // Errores de Usuarios
  USER_NOT_FOUND: Object.freeze({
    code: 'USER_NOT_FOUND',
    statusCode: 404,
    message: 'El usuario solicitado no existe en el sistema',
  }),
  USER_ALREADY_EXISTS: Object.freeze({
    code: 'USER_ALREADY_EXISTS',
    statusCode: 409,
    message: 'El correo electrónico ya se encuentra registrado',
  }),
  INVALID_USER_ROLE: Object.freeze({
    code: 'INVALID_USER_ROLE',
    statusCode: 400,
    message: 'El rol de usuario proporcionado no es válido',
  }),

  // Errores de Pedidos (Orders)
  ORDER_NOT_FOUND: Object.freeze({
    code: 'ORDER_NOT_FOUND',
    statusCode: 404,
    message: 'El pedido solicitado no fue encontrado',
  }),
  ORDER_CODE_EXISTS: Object.freeze({
    code: 'ORDER_CODE_EXISTS',
    statusCode: 409,
    message: 'El código de pedido ya se encuentra registrado',
  }),

  // Errores de Productos (Products)
  PRODUCT_NOT_FOUND: Object.freeze({
    code: 'PRODUCT_NOT_FOUND',
    statusCode: 404,
    message: 'El producto solicitado no fue encontrado',
  }),

  // Errores de Entregas (Deliveries)
  DELIVERY_NOT_FOUND: Object.freeze({
    code: 'DELIVERY_NOT_FOUND',
    statusCode: 404,
    message: 'La entrega solicitada no fue encontrada',
  }),
  INVALID_DRIVER_ROLE: Object.freeze({
    code: 'INVALID_DRIVER_ROLE',
    statusCode: 400,
    message: 'El usuario asignado a la entrega no posee el rol de repartidor',
  }),

  // Errores de Estado y Reglas de Dominio
  INVALID_STATE: Object.freeze({
    code: 'INVALID_STATE',
    statusCode: 400,
    message: 'El estado proporcionado no es válido para esta entidad',
  }),
  INVALID_PRIORITY: Object.freeze({
    code: 'INVALID_PRIORITY',
    statusCode: 400,
    message: 'La prioridad proporcionada no es válida',
  }),
  NEGATIVE_VALUE: Object.freeze({
    code: 'NEGATIVE_VALUE',
    statusCode: 400,
    message: 'No se permiten valores negativos en campos numéricos',
  }),

  // Errores del Módulo de Mocks
  INVALID_MOCK_QUANTITY: Object.freeze({
    code: 'INVALID_MOCK_QUANTITY',
    statusCode: 400,
    message: 'La cantidad de mocks solicitada es inválida. Debe ser un número entero positivo entre 1 y 1000',
  }),
  INVALID_MOCK_COLLECTION: Object.freeze({
    code: 'INVALID_MOCK_COLLECTION',
    statusCode: 400,
    message: 'La colección especificada para mocking no es válida. Opciones permitidas: usuarios, pedidos, entregas, all',
  }),
  MOCK_SEED_FAILURE: Object.freeze({
    code: 'MOCK_SEED_FAILURE',
    statusCode: 500,
    message: 'Ocurrió un fallo controlado durante la carga o limpieza de datos de prueba en MongoDB',
  }),

  // Errores Generales de Validación, Rutas e Infraestructura
  VALIDATION_ERROR: Object.freeze({
    code: 'VALIDATION_ERROR',
    statusCode: 400,
    message: 'Los datos enviados no superaron las validaciones requeridas',
  }),
  MISSING_REQUIRED_FIELDS: Object.freeze({
    code: 'MISSING_REQUIRED_FIELDS',
    statusCode: 400,
    message: 'Faltan campos obligatorios para procesar la solicitud',
  }),
  INVALID_OBJECT_ID: Object.freeze({
    code: 'INVALID_OBJECT_ID',
    statusCode: 400,
    message: 'El identificador proporcionado no tiene un formato válido de MongoDB (ObjectId)',
  }),
  INVALID_JSON_PAYLOAD: Object.freeze({
    code: 'INVALID_JSON_PAYLOAD',
    statusCode: 400,
    message: 'El cuerpo de la petición contiene un formato JSON inválido',
  }),
  DUPLICATE_RESOURCE: Object.freeze({
    code: 'DUPLICATE_RESOURCE',
    statusCode: 409,
    message: 'Ya existe un registro con los valores únicos proporcionados',
  }),
  ROUTE_NOT_FOUND: Object.freeze({
    code: 'ROUTE_NOT_FOUND',
    statusCode: 404,
    message: 'La ruta solicitada no existe en ShipNow API',
  }),
  DATABASE_ERROR: Object.freeze({
    code: 'DATABASE_ERROR',
    statusCode: 500,
    message: 'Error al procesar la operación en la base de datos MongoDB',
  }),
  INTERNAL_SERVER_ERROR: Object.freeze({
    code: 'INTERNAL_SERVER_ERROR',
    statusCode: 500,
    message: 'Error interno no controlado en el servidor',
  }),
});

export default ERROR_DICTIONARY;
