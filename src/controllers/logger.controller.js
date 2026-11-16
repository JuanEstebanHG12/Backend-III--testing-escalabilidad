import config from '../config/env.config.js';
import {
  logger,
  CUSTOM_LOG_LEVELS,
  resolveLogLevelByEnv,
} from '../config/logger.config.js';

/**
 * Capa Controller de Prueba de Logger:
 * Herramienta interna para verificar que todos los niveles de Winston (debug, http, info, warning, error, fatal)
 * se emiten en consola y se persisten en /logs/error.log y en los archivos con rotación diaria.
 */
export class LoggerController {
  /**
   * GET /api/loggerTest (también disponible en /loggerTest y /api/logger-test)
   */
  testLogger = (req, res, next) => {
    try {
      const activeLogger = req.logger || logger;

      activeLogger.debug('Prueba de log [debug]: información detallada de depuración de ShipNow');
      activeLogger.http(`Prueba de log [http]: ${req.method} ${req.originalUrl} procesado correctamente`);
      activeLogger.info('Prueba de log [info]: Servidor ShipNow operativo y servicios activos');
      activeLogger.warning('Prueba de log [warning]: Pedido #A-102 sin repartidor asignado');
      activeLogger.error('Prueba de log [error]: Falló la creación del pedido: ValidationError (campo "destino" requerido)');
      activeLogger.fatal('Prueba de log [fatal]: Fallo crítico simulado en la infraestructura del servidor');

      return res.status(200).json({
        success: true,
        message: 'Prueba de todos los niveles del logger ejecutada exitosamente',
        environment: config.NODE_ENV,
        activeLevel: resolveLogLevelByEnv(config.NODE_ENV),
        testedLevels: Object.keys(CUSTOM_LOG_LEVELS.levels),
        files: {
          errorLog: 'logs/error.log (solo niveles error y fatal)',
          rotatedErrorLog: 'logs/error-YYYY-MM-DD.log',
          rotatedCombinedLog: 'logs/combined-YYYY-MM-DD.log',
        },
      });
    } catch (error) {
      next(error);
    }
  };
}
