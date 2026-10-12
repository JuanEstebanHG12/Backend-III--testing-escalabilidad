import { Router } from 'express';
import productRoutes from './product.routes.js';
import userRoutes from './user.routes.js';
import mockRoutes from './mock.routes.js';

const router = Router();

// Agrupamos las rutas de cada entidad
router.use('/products', productRoutes);
router.use('/users', userRoutes);
router.use('/mocks', mockRoutes);

export default router;
