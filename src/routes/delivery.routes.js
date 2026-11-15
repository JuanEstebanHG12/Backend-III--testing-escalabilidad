import { Router } from 'express';
import { DeliveryController } from '../controllers/delivery.controller.js';

const router = Router();
const deliveryController = new DeliveryController();

/**
 * Rutas de Entregas (/api/deliveries):
 * Archivo mínimo que solo asocia cada endpoint HTTP con el método del Controller correspondiente.
 */
router.get('/', deliveryController.getAll);
router.get('/:id', deliveryController.getById);
router.post('/', deliveryController.create);
router.put('/:id', deliveryController.update);
router.delete('/:id', deliveryController.delete);

export default router;
