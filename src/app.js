import express from 'express';
import apiRouter from './routes/index.js';

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

// Middleware para manejo de rutas no encontradas (404)
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Ruta no encontrada: ${req.method} ${req.originalUrl}`,
  });
});

// Middleware centralizado de manejo de errores
app.use((err, req, res, next) => {
  console.error('Error capturado:', err.message);

  const statusCode = err.statusCode || 500;
  return res.status(statusCode).json({
    success: false,
    message: err.message || 'Error interno del servidor',
  });
});

export default app;
