import mongoose from 'mongoose';
import config from './env.config.js';

/**
 * Función encargada de conectar la aplicación con la base de datos MongoDB.
 * Utiliza la URI validada desde la configuración centralizada.
 */
export const connectDB = async () => {
  try {
    await mongoose.connect(config.MONGODB_URI);
    console.log('✅ Conexión exitosa a MongoDB');
  } catch (error) {
    console.error('❌ Error al conectar a MongoDB:', error.message);
    // Salimos del proceso si no se puede conectar a la base de datos
    process.exit(1);
  }
};
