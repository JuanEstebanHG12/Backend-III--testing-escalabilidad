import { ERROR_DICTIONARY } from './error.dictionary.js';

/**
 * Clase base para todos los errores operacionales del dominio ShipNow.
 * Estandariza código interno, código HTTP, mensaje descriptivo y metadatos/detalles.
 */
export class AppError extends Error {
  /**
   * @param {Object} options
   * @param {string} options.message - Mensaje descriptivo del error
   * @param {string} [options.code] - Código único del diccionario de errores
   * @param {number} [options.statusCode] - Código de estado HTTP
   * @param {any} [options.details] - Información adicional o contexto del error
   */
  constructor({
    message = ERROR_DICTIONARY.INTERNAL_SERVER_ERROR.message,
    code = ERROR_DICTIONARY.INTERNAL_SERVER_ERROR.code,
    statusCode = ERROR_DICTIONARY.INTERNAL_SERVER_ERROR.statusCode,
    details = null,
  } = {}) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
    this.isOperational = true;
    this.timestamp = new Date().toISOString();

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  /**
   * Método fábrica para instanciar un error directamente desde una entrada del diccionario.
   */
  static fromDictionary(dictionaryEntry, customMessage = null, details = null) {
    const entry = dictionaryEntry || ERROR_DICTIONARY.INTERNAL_SERVER_ERROR;
    return new AppError({
      message: customMessage || entry.message,
      code: entry.code,
      statusCode: entry.statusCode,
      details,
    });
  }
}

// Alias para compatibilidad con convenciones CustomError
export { AppError as CustomError };

/**
 * Error de dominio: Usuario inexistente (404)
 */
export class UserNotFoundError extends AppError {
  constructor(identifier = null, customMessage = null) {
    const defaultMsg = identifier
      ? `No se encontró el usuario con identificador: ${identifier}`
      : ERROR_DICTIONARY.USER_NOT_FOUND.message;

    super({
      message: customMessage || defaultMsg,
      code: ERROR_DICTIONARY.USER_NOT_FOUND.code,
      statusCode: ERROR_DICTIONARY.USER_NOT_FOUND.statusCode,
      details: identifier ? { userId: identifier } : null,
    });
  }
}

/**
 * Error de dominio: Pedido no encontrado (404)
 */
export class OrderNotFoundError extends AppError {
  constructor(identifier = null, customMessage = null) {
    const defaultMsg = identifier
      ? `No se encontró el pedido con identificador: ${identifier}`
      : ERROR_DICTIONARY.ORDER_NOT_FOUND.message;

    super({
      message: customMessage || defaultMsg,
      code: ERROR_DICTIONARY.ORDER_NOT_FOUND.code,
      statusCode: ERROR_DICTIONARY.ORDER_NOT_FOUND.statusCode,
      details: identifier ? { orderId: identifier } : null,
    });
  }
}

/**
 * Error de dominio: Producto no encontrado (404)
 */
export class ProductNotFoundError extends AppError {
  constructor(identifier = null, customMessage = null) {
    const defaultMsg = identifier
      ? `No se encontró el producto con identificador: ${identifier}`
      : ERROR_DICTIONARY.PRODUCT_NOT_FOUND.message;

    super({
      message: customMessage || defaultMsg,
      code: ERROR_DICTIONARY.PRODUCT_NOT_FOUND.code,
      statusCode: ERROR_DICTIONARY.PRODUCT_NOT_FOUND.statusCode,
      details: identifier ? { productId: identifier } : null,
    });
  }
}

/**
 * Error de dominio: Entrega no encontrada (404)
 */
export class DeliveryNotFoundError extends AppError {
  constructor(identifier = null, customMessage = null) {
    const defaultMsg = identifier
      ? `No se encontró la entrega con identificador: ${identifier}`
      : ERROR_DICTIONARY.DELIVERY_NOT_FOUND.message;

    super({
      message: customMessage || defaultMsg,
      code: ERROR_DICTIONARY.DELIVERY_NOT_FOUND.code,
      statusCode: ERROR_DICTIONARY.DELIVERY_NOT_FOUND.statusCode,
      details: identifier ? { deliveryId: identifier } : null,
    });
  }
}

/**
 * Error de dominio: Estado inválido para pedido, producto o entrega (400)
 */
export class InvalidStateError extends AppError {
  constructor(receivedState, allowedStates = [], entity = 'entidad') {
    const allowedText = allowedStates.length > 0 ? `. Estados permitidos: ${allowedStates.join(', ')}` : '';
    super({
      message: `Estado inválido '${receivedState}' para ${entity}${allowedText}`,
      code: ERROR_DICTIONARY.INVALID_STATE.code,
      statusCode: ERROR_DICTIONARY.INVALID_STATE.statusCode,
      details: {
        entity,
        receivedState,
        allowedStates,
      },
    });
  }
}

/**
 * Error de dominio: Prioridad inválida para un pedido (400)
 */
export class InvalidPriorityError extends AppError {
  constructor(receivedPriority, allowedPriorities = []) {
    const allowedText =
      allowedPriorities.length > 0 ? `. Prioridades permitidas: ${allowedPriorities.join(', ')}` : '';
    super({
      message: `Prioridad inválida '${receivedPriority}'${allowedText}`,
      code: ERROR_DICTIONARY.INVALID_PRIORITY.code,
      statusCode: ERROR_DICTIONARY.INVALID_PRIORITY.statusCode,
      details: {
        receivedPriority,
        allowedPriorities,
      },
    });
  }
}

/**
 * Error de dominio: Rol de usuario inválido (400)
 */
export class InvalidRoleError extends AppError {
  constructor(receivedRole, allowedRoles = [], customMessage = null) {
    const uniqueRoles = [...new Set(allowedRoles)];
    const allowedText = uniqueRoles.length > 0 ? `. Roles permitidos: ${uniqueRoles.join(', ')}` : '';
    super({
      message: customMessage || `Rol inválido: '${receivedRole}'${allowedText}`,
      code: ERROR_DICTIONARY.INVALID_USER_ROLE.code,
      statusCode: ERROR_DICTIONARY.INVALID_USER_ROLE.statusCode,
      details: {
        receivedRole,
        allowedRoles: uniqueRoles,
      },
    });
  }
}

/**
 * Error de dominio: Cantidad incorrecta de mocks (400)
 */
export class InvalidMockQuantityError extends AppError {
  constructor(receivedQty, customMessage = null, details = null) {
    super({
      message:
        customMessage ||
        `Cantidad de mocks inválida ('${receivedQty}'). Debe ser un número entero positivo entre 1 y 1000`,
      code: ERROR_DICTIONARY.INVALID_MOCK_QUANTITY.code,
      statusCode: ERROR_DICTIONARY.INVALID_MOCK_QUANTITY.statusCode,
      details: details || { receivedQty, min: 1, max: 1000 },
    });
  }
}

/**
 * Error de dominio: Valores negativos no permitidos (400)
 */
export class NegativeValueError extends AppError {
  constructor(field = 'valor', receivedValue = null, customMessage = null) {
    super({
      message:
        customMessage ||
        `El campo '${field}' no permite valores negativos (valor recibido: ${receivedValue})`,
      code: ERROR_DICTIONARY.NEGATIVE_VALUE.code,
      statusCode: ERROR_DICTIONARY.NEGATIVE_VALUE.statusCode,
      details: { field, receivedValue },
    });
  }
}

/**
 * Error de dominio: Colección inválida en el módulo de mocks (400)
 */
export class InvalidMockCollectionError extends AppError {
  constructor(collection, allowedCollections = ['usuarios', 'pedidos', 'entregas', 'all']) {
    super({
      message: `Colección no válida para mocking: '${collection}'. Opciones permitidas: ${allowedCollections.join(', ')}`,
      code: ERROR_DICTIONARY.INVALID_MOCK_COLLECTION.code,
      statusCode: ERROR_DICTIONARY.INVALID_MOCK_COLLECTION.statusCode,
      details: {
        receivedCollection: collection,
        allowedCollections,
      },
    });
  }
}

/**
 * Error de dominio: Falla durante la carga o limpieza de mocks en MongoDB (500)
 */
export class MockSeedError extends AppError {
  constructor(customMessage = null, details = null) {
    super({
      message: customMessage || ERROR_DICTIONARY.MOCK_SEED_FAILURE.message,
      code: ERROR_DICTIONARY.MOCK_SEED_FAILURE.code,
      statusCode: ERROR_DICTIONARY.MOCK_SEED_FAILURE.statusCode,
      details,
    });
  }
}

/**
 * Error de dominio: Recurso duplicado (ej. email o código único) (409)
 */
export class DuplicateResourceError extends AppError {
  constructor(customMessage = null, details = null, code = ERROR_DICTIONARY.DUPLICATE_RESOURCE.code) {
    super({
      message: customMessage || ERROR_DICTIONARY.DUPLICATE_RESOURCE.message,
      code,
      statusCode: ERROR_DICTIONARY.DUPLICATE_RESOURCE.statusCode,
      details,
    });
  }
}

/**
 * Error de dominio: Validación de datos o campos obligatorios (400)
 */
export class ValidationError extends AppError {
  constructor(customMessage = null, details = null, code = ERROR_DICTIONARY.VALIDATION_ERROR.code) {
    super({
      message: customMessage || ERROR_DICTIONARY.VALIDATION_ERROR.message,
      code,
      statusCode: ERROR_DICTIONARY.VALIDATION_ERROR.statusCode,
      details,
    });
  }
}

/**
 * Error de dominio: Identificador (ObjectId) con formato inválido (400)
 */
export class InvalidIdError extends AppError {
  constructor(id, entity = 'recurso') {
    super({
      message: `El ID '${id}' proporcionado para ${entity} no tiene un formato válido de MongoDB`,
      code: ERROR_DICTIONARY.INVALID_OBJECT_ID.code,
      statusCode: ERROR_DICTIONARY.INVALID_OBJECT_ID.statusCode,
      details: { id, entity },
    });
  }
}

/**
 * Error de dominio: Ruta no encontrada (404)
 */
export class RouteNotFoundError extends AppError {
  constructor(method, originalUrl) {
    super({
      message: `Ruta no encontrada: ${method} ${originalUrl}`,
      code: ERROR_DICTIONARY.ROUTE_NOT_FOUND.code,
      statusCode: ERROR_DICTIONARY.ROUTE_NOT_FOUND.statusCode,
      details: { method, path: originalUrl },
    });
  }
}

/**
 * Error de infraestructura: Error de base de datos (500)
 */
export class DatabaseError extends AppError {
  constructor(customMessage = null, details = null) {
    super({
      message: customMessage || ERROR_DICTIONARY.DATABASE_ERROR.message,
      code: ERROR_DICTIONARY.DATABASE_ERROR.code,
      statusCode: ERROR_DICTIONARY.DATABASE_ERROR.statusCode,
      details,
    });
  }
}
