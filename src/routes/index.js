import { Router } from 'express';
import productRoutes from './product.routes.js';
import userRoutes from './user.routes.js';
import orderRoutes from './order.routes.js';
import deliveryRoutes from './delivery.routes.js';
import mockRoutes from './mock.routes.js';
import loggerRoutes from './logger.routes.js';

const router = Router();

// Agrupamos las rutas de cada entidad, mocks y prueba de logger
router.use('/products', productRoutes);
router.use('/users', userRoutes);
router.use('/orders', orderRoutes);
router.use('/deliveries', deliveryRoutes);
router.use('/mocks', mockRoutes);
router.use('/loggerTest', loggerRoutes);
router.use('/logger-test', loggerRoutes);

export default router;
