import mongoose from 'mongoose';
import config from './env.config.js';
import { logger } from './logger.config.js';

/**
 * Función encargada de conectar la aplicación con la base de datos MongoDB.
 * Utiliza la URI validada desde la configuración centralizada y registra eventos con Winston.
 */
export const connectDB = async () => {
  try {
    await mongoose.connect(config.MONGODB_URI);
    logger.info('Conexión a MongoDB establecida');
  } catch (error) {
    logger.fatal(`Error crítico al conectar a MongoDB: ${error.message}`);
    process.exit(1);
  }
};
