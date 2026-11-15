import express from 'express';
import apiRouter from './routes/index.js';
import {
  notFoundMiddleware,
  errorMiddleware,
} from './middlewares/error.middleware.js';

const app = express();

// Middlewares para procesar cuerpos en JSON y URL-encoded
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Endpoint de bienvenida / verificación de estado
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'API de ShipNow activa y funcionando',
  });
});

// Enrutador principal de la API
app.use('/api', apiRouter);

// Middleware para rutas no encontradas (delega RouteNotFoundError al middleware global)
app.use(notFoundMiddleware);

// Middleware global centralizado de manejo de errores (única salida de errores HTTP)
app.use(errorMiddleware);

export default app;
