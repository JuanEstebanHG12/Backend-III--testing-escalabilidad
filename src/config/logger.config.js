import fs from 'node:fs';
import path from 'node:path';
import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import config from './env.config.js';

/**
 * Carpeta central donde se almacenan los archivos de logs persistidos y rotados.
 */
export const LOGS_DIR = path.resolve(process.cwd(), 'logs');

if (!fs.existsSync(LOGS_DIR)) {
  fs.mkdirSync(LOGS_DIR, { recursive: true });
}

/**
 * Definición de niveles personalizados de ShipNow API (de mayor a menor severidad).
 * Al ubicar 'fatal' (0) y 'error' (1) en los niveles superiores, cualquier transporte
 * con level: 'error' registrará únicamente 'error' y 'fatal'.
 */
export const CUSTOM_LOG_LEVELS = Object.freeze({
  levels: Object.freeze({
    fatal: 0,
    error: 1,
    warning: 2,
    info: 3,
    http: 4,
    debug: 5,
  }),
  colors: Object.freeze({
    fatal: 'magenta',
    error: 'red',
    warning: 'yellow',
    info: 'green',
    http: 'cyan',
    debug: 'blue',
  }),
});

winston.addColors(CUSTOM_LOG_LEVELS.colors);

/**
 * Determina el nivel mínimo de log según el entorno (NODE_ENV):
 * - development: 'debug' (muestra todos los niveles: debug, http, info, warning, error, fatal)
 * - production:  'info'  (solo registra info, warning, error y fatal)
 */
export const resolveLogLevelByEnv = (env = config.NODE_ENV) => {
  return env === 'production' ? 'info' : 'debug';
};

/**
 * Formateador de líneas de log (sin códigos ANSI) para archivos y consola:
 * Ejemplo: 2026-08-01 10:12:03 [info]    Servidor ShipNow escuchando en el puerto 3000
 */
export const formatLogEntry = ({ timestamp, level, message }) => {
  const cleanLevel = String(level).replace(/\u001b\[[0-9;]*m/g, '');
  const paddedTag = `[${cleanLevel}]`.padEnd(9, ' ');
  return `${timestamp} ${paddedTag} ${message}`;
};

const baseFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.printf(formatLogEntry)
);

const consoleFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.printf((info) => {
    const cleanLevel = String(info.level).replace(/\u001b\[[0-9;]*m/g, '');
    const paddedTag = `[${cleanLevel}]`.padEnd(9, ' ');
    const colorizer = winston.format.colorize();
    const coloredTag = colorizer.colorize(cleanLevel, paddedTag);
    return `${info.timestamp} ${coloredTag} ${info.message}`;
  })
);

/**
 * Construye una instancia de logger Winston configurada según el entorno indicado.
 */
export const createLoggerInstance = (env = config.NODE_ENV, logsDirectory = LOGS_DIR) => {
  const activeLevel = resolveLogLevelByEnv(env);

  if (!fs.existsSync(logsDirectory)) {
    fs.mkdirSync(logsDirectory, { recursive: true });
  }

  const transports = [
    // 1. Salida por consola (nivel dinámico según entorno: debug en dev, info en prod)
    new winston.transports.Console({
      level: activeLevel,
      format: consoleFormat,
    }),

    // 2. Archivo dedicado de errores (/logs/error.log): SOLO guarda niveles 'error' y 'fatal'
    new winston.transports.File({
      filename: path.join(logsDirectory, 'error.log'),
      level: 'error',
      format: baseFormat,
      maxsize: 5 * 1024 * 1024, // 5 MB por archivo
      maxFiles: 5,
    }),

    // 3. Rotación diaria de errores críticos (/logs/error-YYYY-MM-DD.log): SOLO 'error' y 'fatal'
    new DailyRotateFile({
      dirname: logsDirectory,
      filename: 'error-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      level: 'error',
      maxSize: '10m',
      maxFiles: '14d',
      auditFile: path.join(logsDirectory, '.error-rotate-audit.json'),
      format: baseFormat,
    }),

    // 4. Rotación diaria de eventos generales (/logs/combined-YYYY-MM-DD.log)
    new DailyRotateFile({
      dirname: logsDirectory,
      filename: 'combined-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      level: activeLevel,
      maxSize: '10m',
      maxFiles: '14d',
      auditFile: path.join(logsDirectory, '.combined-rotate-audit.json'),
      format: baseFormat,
    }),
  ];

  return winston.createLogger({
    levels: CUSTOM_LOG_LEVELS.levels,
    level: activeLevel,
    format: baseFormat,
    transports,
    exitOnError: false,
  });
};

export const logger = createLoggerInstance(config.NODE_ENV, LOGS_DIR);

export default logger;
