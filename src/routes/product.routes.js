import { Router } from 'express';
import { ProductController } from '../controllers/product.controller.js';

const router = Router();
const productController = new ProductController();

/**
 * Rutas de Productos:
 * Archivo mínimo que solo asocia el endpoint HTTP con el método del Controller correspondiente.
 */
router.get('/', productController.getAll);
router.get('/:id', productController.getById);
router.post('/', productController.create);
router.put('/:id', productController.update);
router.delete('/:id', productController.delete);

export default router;
