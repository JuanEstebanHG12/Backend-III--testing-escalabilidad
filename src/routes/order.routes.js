import { Router } from 'express';
import { OrderController } from '../controllers/order.controller.js';

const router = Router();
const orderController = new OrderController();

/**
 * Rutas de Pedidos (/api/orders):
 * Archivo mínimo que solo asocia cada endpoint HTTP con el método del Controller correspondiente.
 */
router.get('/', orderController.getAll);
router.get('/:id', orderController.getById);
router.post('/', orderController.create);
router.put('/:id', orderController.update);
router.patch('/:id/status', orderController.updateStatus);
router.delete('/:id', orderController.delete);

export default router;
