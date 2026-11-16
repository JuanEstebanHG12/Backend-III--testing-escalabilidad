import { Router } from 'express';
import { UserController } from '../controllers/user.controller.js';
import { uploadUserDocumentMiddleware } from '../config/multer.config.js';

const router = Router();
const userController = new UserController();

/**
 * Rutas de Usuarios:
 * Archivo mínimo que solo asocia el endpoint HTTP con el método del Controller correspondiente.
 */
router.get('/', userController.getAll);
router.get('/:id', userController.getById);
router.post('/', userController.create);
router.put('/:id', userController.update);
router.delete('/:id', userController.delete);
router.post('/:id/documents', uploadUserDocumentMiddleware, userController.uploadDocument);

export default router;
