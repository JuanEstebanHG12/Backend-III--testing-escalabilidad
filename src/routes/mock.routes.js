import { Router } from 'express';
import { MockController } from '../controllers/mock.controller.js';

const router = Router();
const mockController = new MockController();

/**
 * Rutas de Mocks (/api/mocks):
 * Archivo mínimo que solo conecta el path con el método del Controller correspondiente.
 * Respeta la separación por capas sin mezclar lógica de generación aquí.
 */

// 1. Endpoints para obtener datos simulados en memoria (SIN guardar en la base de datos)
router.get('/users', mockController.getMockUsers);
router.get('/orders', mockController.getMockOrders);
router.get('/deliveries', mockController.getMockDeliveries);
router.get('/all', mockController.getMockAll);

// 2. Endpoint para insertar registros simulados en MongoDB de forma controlada
router.post('/seed', mockController.seedData);

// 3. Endpoint auxiliar para limpiar colecciones de prueba
router.delete('/clear', mockController.clearData);

export default router;
