import { Router } from 'express';
import { LoggerController } from '../controllers/logger.controller.js';

const router = Router();
const loggerController = new LoggerController();

/**
 * Rutas de prueba del sistema de Logging:
 * Expone el endpoint interno para disparar todos los niveles de Winston.
 */
router.get('/', loggerController.testLogger);

export default router;
