import app from './app.js';
import config from './config/env.config.js';
import { connectDB } from './config/db.config.js';

/**
 * Función principal para iniciar la aplicación:
 * 1. Primero valida variables de entorno (ocurre al importar env.config.js).
 * 2. Conecta con la base de datos MongoDB.
 * 3. Levanta el servidor HTTP en el puerto configurado.
 */
const startServer = async () => {
  try {
    // Conectamos a MongoDB
    await connectDB();

    // Iniciamos el servidor Express
    app.listen(config.PORT, () => {
      console.log(`🚀 Servidor de ShipNow corriendo en el puerto ${config.PORT}`);
      console.log(`📍 Entorno actual: ${config.NODE_ENV}`);
      console.log(`📡 Endpoints base: http://localhost:${config.PORT}/api/products y http://localhost:${config.PORT}/api/users`);
    });
  } catch (error) {
    console.error('❌ Error al iniciar el servidor:', error.message);
    process.exit(1);
  }
};

startServer();
