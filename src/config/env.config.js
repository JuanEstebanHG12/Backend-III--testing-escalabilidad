import fs from 'node:fs';
import path from 'node:path';
import dotenv from 'dotenv';

// Si estamos en entorno de testing y existe .env.test, lo cargamos con prioridad sobre .env
const isTestEnv = process.env.NODE_ENV === 'test';
const envTestPath = path.resolve(process.cwd(), '.env.test');

if (isTestEnv && fs.existsSync(envTestPath)) {
  dotenv.config({ path: envTestPath });
}
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

/**
 *Construye una URI de base de datos aislada para el entorno de testing (ej. shipnow_test)
 * si no se definió explícitamente MONGODB_URI_TEST, garantizando que los tests nunca
 * afecten la base de datos de desarrollo o producción.
 */
const buildTestMongoUri = (baseUri, explicitTestUri) => {
  if (explicitTestUri && explicitTestUri.trim()) {
    return explicitTestUri.trim();
  }
  try {
    const url = new URL(baseUri);
    const dbName = url.pathname.replace(/^\//, '') || 'shipnow';
    url.pathname = dbName.endsWith('_test') ? `/${dbName}` : `/${dbName}_test`;
    return url.toString();
  } catch {
    return `${baseUri}_test`;
  }
};

const resolvedMongoUri =
  process.env.NODE_ENV === 'test'
    ? buildTestMongoUri(process.env.MONGODB_URI, process.env.MONGODB_URI_TEST)
    : process.env.MONGODB_URI;

// Exportamos un objeto congelado con la configuración validada
const config = Object.freeze({
  PORT: Number(process.env.PORT) || 8080,
  NODE_ENV: process.env.NODE_ENV,
  MONGODB_URI: resolvedMongoUri,
  MONGODB_URI_TEST: buildTestMongoUri(process.env.MONGODB_URI, process.env.MONGODB_URI_TEST),
  IS_TEST: process.env.NODE_ENV === 'test',
});

export default config;
