import dotenv from 'dotenv';

// Cargamos las variables de entorno desde el archivo .env
dotenv.config();

// Lista de variables de entorno obligatorias para que la aplicación funcione
const requiredEnvVars = ['PORT', 'MONGODB_URI', 'NODE_ENV'];

// Validamos que todas las variables obligatorias estén presentes
const missingEnvVars = requiredEnvVars.filter((key) => !process.env[key]);

if (missingEnvVars.length > 0) {
  throw new Error(
    `[ERROR DE CONFIGURACIÓN] Faltan las siguientes variables de entorno requeridas en el archivo .env: ${missingEnvVars.join(
      ', '
    )}. Por favor, revisa el archivo .env.example para configurarlas.`
  );
}

// Exportamos un objeto congelado con la configuración validada
// para evitar modificaciones accidentales en tiempo de ejecución.
const config = Object.freeze({
  PORT: Number(process.env.PORT) || 8080,
  NODE_ENV: process.env.NODE_ENV,
  MONGODB_URI: process.env.MONGODB_URI,
});

export default config;
