import express from 'express';
import apiRouter from './routes/index.js';
import loggerRoutes from './routes/logger.routes.js';
import {
  swaggerUi,
  swaggerSpec,
  swaggerUiOptions,
} from './config/swagger.config.js';
import { requestLoggerMiddleware } from './middlewares/logger.middleware.js';
import {
  notFoundMiddleware,
  errorMiddleware,
} from './middlewares/error.middleware.js';

const app = express();

// Middlewares para procesar cuerpos en JSON y URL-encoded
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware global para registrar peticiones HTTP con Winston
app.use(requestLoggerMiddleware);

// Endpoint de bienvenida / verificación de estado
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'API de ShipNow activa y funcionando',
    documentation: '/api/docs',
  });
});

// Documentación interactiva con Swagger UI (/api/docs) y especificación JSON (/api/docs.json)
app.get('/api/docs.json', (req, res) => {
  res.status(200).json(swaggerSpec);
});
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, swaggerUiOptions));

// Endpoint de prueba del logger en raíz (/loggerTest) además de /api/loggerTest
app.use('/loggerTest', loggerRoutes);

// Enrutador principal de la API
app.use('/api', apiRouter);

// Middleware para rutas no encontradas (delega RouteNotFoundError al middleware global)
app.use(notFoundMiddleware);

// Middleware global centralizado de manejo de errores (única salida de errores HTTP)
app.use(errorMiddleware);

export default app;
