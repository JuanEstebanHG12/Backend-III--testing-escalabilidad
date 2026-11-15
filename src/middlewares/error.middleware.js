import {
  AppError,
  ERROR_DICTIONARY,
  RouteNotFoundError,
} from '../errors/index.js';

/**
 * Normaliza cualquier error (de dominio, de Mongoose/MongoDB, de sintaxis JSON o inesperado)
 * a una instancia uniforme de AppError basada en el ERROR_DICTIONARY.
 */
const normalizeError = (err) => {
  // 1. Si ya es un error operacional de nuestro dominio (AppError), lo conservamos
  if (err instanceof AppError) {
    return err;
  }

  // 2. Error de formato de ObjectId en Mongoose (CastError)
  if (err.name === 'CastError') {
    return new AppError({
      message: `El valor '${err.value}' no es un identificador válido para el campo '${err.path}'`,
      code: ERROR_DICTIONARY.INVALID_OBJECT_ID.code,
      statusCode: ERROR_DICTIONARY.INVALID_OBJECT_ID.statusCode,
      details: { field: err.path, value: err.value },
    });
  }

  // 3. Error de validación de esquema de Mongoose
  if (err.name === 'ValidationError' && err.errors) {
    const validationDetails = Object.values(err.errors).map((fieldErr) => ({
      field: fieldErr.path,
      message: fieldErr.message,
      value: fieldErr.value,
    }));

    return new AppError({
      message: validationDetails.map((d) => d.message).join('. ') || ERROR_DICTIONARY.VALIDATION_ERROR.message,
      code: ERROR_DICTIONARY.VALIDATION_ERROR.code,
      statusCode: ERROR_DICTIONARY.VALIDATION_ERROR.statusCode,
      details: validationDetails,
    });
  }

  // 4. Error de clave duplicada en MongoDB (E11000)
  if (err.code === 11000) {
    const duplicatedFields = err.keyValue ? Object.keys(err.keyValue).join(', ') : 'campo único';
    return new AppError({
      message: `Ya existe un registro con el mismo valor en: ${duplicatedFields}`,
      code: ERROR_DICTIONARY.DUPLICATE_RESOURCE.code,
      statusCode: ERROR_DICTIONARY.DUPLICATE_RESOURCE.statusCode,
      details: err.keyValue || null,
    });
  }

  // 5. Error de sintaxis en el body JSON enviado por el cliente
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return new AppError({
      message: ERROR_DICTIONARY.INVALID_JSON_PAYLOAD.message,
      code: ERROR_DICTIONARY.INVALID_JSON_PAYLOAD.code,
      statusCode: ERROR_DICTIONARY.INVALID_JSON_PAYLOAD.statusCode,
    });
  }

  // 6. Errores propios de conexión o motor de MongoDB/Mongoose
  if (err.name && (err.name.startsWith('Mongo') || err.name.startsWith('Mongoose'))) {
    return new AppError({
      message: ERROR_DICTIONARY.DATABASE_ERROR.message,
      code: ERROR_DICTIONARY.DATABASE_ERROR.code,
      statusCode: ERROR_DICTIONARY.DATABASE_ERROR.statusCode,
      details: { reason: err.message },
    });
  }

  // 7. Fallback para cualquier error no previsto
  return new AppError({
    message: err.message || ERROR_DICTIONARY.INTERNAL_SERVER_ERROR.message,
    code: err.code || ERROR_DICTIONARY.INTERNAL_SERVER_ERROR.code,
    statusCode: err.statusCode || ERROR_DICTIONARY.INTERNAL_SERVER_ERROR.statusCode,
    details: err.details || null,
  });
};

/**
 * Middleware para rutas inexistentes (404).
 * No responde directamente; delega un RouteNotFoundError al middleware global de errores.
 */
export const notFoundMiddleware = (req, res, next) => {
  next(new RouteNotFoundError(req.method, req.originalUrl));
};

/**
 * Middleware global centralizado de manejo de errores.
 * Único punto del sistema que envía respuestas HTTP de error al cliente,
 * garantizando una estructura clara, predecible y uniforme en toda la API.
 */
export const errorMiddleware = (err, req, res, next) => {
  const normalizedError = normalizeError(err);

  console.error(
    `[ERROR] [${normalizedError.code}] ${req.method} ${req.originalUrl} -> ${normalizedError.statusCode}: ${normalizedError.message}`
  );

  return res.status(normalizedError.statusCode).json({
    success: false,
    message: normalizedError.message,
    error: {
      code: normalizedError.code,
      name: normalizedError.name,
      message: normalizedError.message,
      statusCode: normalizedError.statusCode,
      details: normalizedError.details,
      path: req.originalUrl,
      method: req.method,
      timestamp: normalizedError.timestamp || new Date().toISOString(),
    },
  });
};

export default errorMiddleware;
