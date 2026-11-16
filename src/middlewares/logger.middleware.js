import { logger } from '../config/logger.config.js';

/**
 * Middleware para adjuntar el logger a req y registrar cada petición HTTP entrante con nivel 'http'.
 */
export const requestLoggerMiddleware = (req, res, next) => {
  req.logger = logger;
  logger.http(`${req.method} ${req.originalUrl}`);
  next();
};

export default requestLoggerMiddleware;
