import app from './app.js';
import config from './config/env.config.js';
import { connectDB } from './config/db.config.js';
import { logger } from './config/logger.config.js';

/**
 * Función principal para iniciar la aplicación:
 * 1. Primero valida variables de entorno (ocurre al importar env.config.js).
 * 2. Conecta con la base de datos MongoDB.
 * 3. Levanta el servidor HTTP en el puerto configurado registrando eventos con Winston.
 */
const startServer = async () => {
  try {
    await connectDB();

    app.listen(config.PORT, () => {
      logger.info(`Servidor ShipNow escuchando en el puerto ${config.PORT} (entorno: ${config.NODE_ENV})`);
      logger.debug(`Endpoints disponibles en http://localhost:${config.PORT}/api`);
    });
  } catch (error) {
    logger.fatal(`Fallo crítico al iniciar el servidor ShipNow: ${error.message}`);
    process.exit(1);
  }
};

startServer();
