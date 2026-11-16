import { Router } from 'express';
import { DeliveryController } from '../controllers/delivery.controller.js';
import { uploadReceiptMiddleware } from '../config/multer.config.js';

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
router.post('/:id/receipt', uploadReceiptMiddleware, deliveryController.uploadReceipt);
router.post('/:id/receipts', uploadReceiptMiddleware, deliveryController.uploadReceipt);

export default router;
