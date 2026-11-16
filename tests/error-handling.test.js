import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import app from '../src/app.js';
import {
  ERROR_DICTIONARY,
  AppError,
  UserNotFoundError,
  OrderNotFoundError,
  ProductNotFoundError,
  DeliveryNotFoundError,
  InvalidStateError,
  InvalidRoleError,
  InvalidMockQuantityError,
  NegativeValueError,
  InvalidMockCollectionError,
  MockSeedError,
  InvalidIdError,
  RouteNotFoundError,
} from '../src/errors/index.js';
import { errorMiddleware } from '../src/middlewares/error.middleware.js';
import { MockService } from '../src/services/mock.service.js';
import { UserService } from '../src/services/user.service.js';
import { ProductService } from '../src/services/product.service.js';
import { OrderService } from '../src/services/order.service.js';
import { DeliveryService } from '../src/services/delivery.service.js';

/**
 * Helper para invocar el middleware global de errores en memoria y verificar su salida uniforme.
 */
const runErrorMiddleware = (err, reqOverrides = {}) => {
  const req = {
    method: reqOverrides.method || 'GET',
    originalUrl: reqOverrides.originalUrl || '/api/test',
  };

  let capturedStatus = null;
  let capturedBody = null;

  const res = {
    status(code) {
      capturedStatus = code;
      return this;
    },
    json(payload) {
      capturedBody = payload;
      return this;
    },
  };

  errorMiddleware(err, req, res, () => {});
  return { status: capturedStatus, body: capturedBody };
};

describe('Pre-entrega Módulo 3 — Manejo profesional de errores en ShipNow API', () => {
  describe('1. Diccionario de Errores y Errores Personalizados del Dominio', () => {
    it('ERROR_DICTIONARY debe ser inmutable (Object.freeze) y contener los casos de dominio', () => {
      assert.equal(Object.isFrozen(ERROR_DICTIONARY), true);
      assert.ok(ERROR_DICTIONARY.USER_NOT_FOUND);
      assert.ok(ERROR_DICTIONARY.ORDER_NOT_FOUND);
      assert.ok(ERROR_DICTIONARY.PRODUCT_NOT_FOUND);
      assert.ok(ERROR_DICTIONARY.DELIVERY_NOT_FOUND);
      assert.ok(ERROR_DICTIONARY.INVALID_STATE);
      assert.ok(ERROR_DICTIONARY.INVALID_MOCK_QUANTITY);
      assert.ok(ERROR_DICTIONARY.NEGATIVE_VALUE);
      assert.ok(ERROR_DICTIONARY.MOCK_SEED_FAILURE);
    });

    it('Debe instanciar errores personalizados con su código y statusCode del diccionario', () => {
      const userErr = new UserNotFoundError('65f1a2b3c4d5e6f7a8b9c0d1');
      assert.equal(userErr instanceof AppError, true);
      assert.equal(userErr.code, 'USER_NOT_FOUND');
      assert.equal(userErr.statusCode, 404);

      const orderErr = new OrderNotFoundError('65f1a2b3c4d5e6f7a8b9c0d2');
      assert.equal(orderErr.code, 'ORDER_NOT_FOUND');
      assert.equal(orderErr.statusCode, 404);

      const stateErr = new InvalidStateError('volando', ['pendiente', 'enviado'], 'pedido');
      assert.equal(stateErr.code, 'INVALID_STATE');
      assert.equal(stateErr.statusCode, 400);

      const qtyErr = new InvalidMockQuantityError('abc');
      assert.equal(qtyErr.code, 'INVALID_MOCK_QUANTITY');
      assert.equal(qtyErr.statusCode, 400);

      const negErr = new NegativeValueError('qty', -5);
      assert.equal(negErr.code, 'NEGATIVE_VALUE');
      assert.equal(negErr.statusCode, 400);

      const seedErr = new MockSeedError('Error de conexión simulado');
      assert.equal(seedErr.code, 'MOCK_SEED_FAILURE');
      assert.equal(seedErr.statusCode, 500);
    });
  });

  describe('2. Middleware Global de Errores y Estructura Uniforme', () => {
    it('Debe transformar errores de dominio en una estructura HTTP uniforme y predecible', () => {
      const domainError = new OrderNotFoundError('65f1a2b3c4d5e6f7a8b9c0d2');
      const { status, body } = runErrorMiddleware(domainError, {
        method: 'GET',
        originalUrl: '/api/orders/65f1a2b3c4d5e6f7a8b9c0d2',
      });

      assert.equal(status, 404);
      assert.equal(body.success, false);
      assert.equal(typeof body.message, 'string');
      assert.ok(body.error);
      assert.equal(body.error.code, 'ORDER_NOT_FOUND');
      assert.equal(body.error.name, 'OrderNotFoundError');
      assert.equal(body.error.statusCode, 404);
      assert.equal(body.error.path, '/api/orders/65f1a2b3c4d5e6f7a8b9c0d2');
      assert.equal(body.error.method, 'GET');
      assert.ok(body.error.timestamp);
    });

    it('Debe normalizar errores de Mongoose (CastError y clave duplicada 11000) a la misma estructura uniforme', () => {
      const castError = { name: 'CastError', path: '_id', value: 'id-invalido' };
      const castResult = runErrorMiddleware(castError);
      assert.equal(castResult.status, 400);
      assert.equal(castResult.body.error.code, 'INVALID_OBJECT_ID');

      const duplicateKeyError = { code: 11000, keyValue: { email: 'repetido@test.com' } };
      const dupResult = runErrorMiddleware(duplicateKeyError);
      assert.equal(dupResult.status, 409);
      assert.equal(dupResult.body.error.code, 'DUPLICATE_RESOURCE');
    });

    it('Debe transformar rutas inexistentes (RouteNotFoundError) con la estructura uniforme', () => {
      const notFoundError = new RouteNotFoundError('POST', '/api/ruta-inexistente');
      const { status, body } = runErrorMiddleware(notFoundError, {
        method: 'POST',
        originalUrl: '/api/ruta-inexistente',
      });

      assert.equal(status, 404);
      assert.equal(body.success, false);
      assert.equal(body.error.code, 'ROUTE_NOT_FOUND');
    });
  });

  describe('3. Validaciones y Manejo de Errores en el Módulo de Mocks', () => {
    it('Debe generar datos correctamente cuando qty es válido o por defecto', () => {
      const mockService = new MockService();
      const users = mockService.getSimulatedUsers(3);
      assert.equal(users.length, 3);
      assert.ok(users[0].nombre);
      assert.ok(users[0].email);
      assert.ok(users[0].rol);
    });

    it('Debe rechazar valores negativos en qty con NegativeValueError (400)', () => {
      const mockService = new MockService();
      assert.throws(
        () => mockService.getSimulatedUsers(-5),
        (err) => err instanceof NegativeValueError && err.statusCode === 400 && err.code === 'NEGATIVE_VALUE'
      );
      assert.throws(
        () => mockService.getSimulatedOrders('-1'),
        (err) => err instanceof NegativeValueError && err.statusCode === 400
      );
    });

    it('Debe rechazar cantidades inválidas (0, texto, decimales, vacío o > 1000) con InvalidMockQuantityError (400)', () => {
      const mockService = new MockService();

      for (const invalidQty of [0, '0', 'abc', '3.5', '', null, 1500]) {
        assert.throws(
          () => mockService.getSimulatedUsers(invalidQty),
          (err) =>
            err instanceof InvalidMockQuantityError &&
            err.statusCode === 400 &&
            err.code === 'INVALID_MOCK_QUANTITY',
          `Debería fallar para qty=${invalidQty}`
        );
      }
    });

    it('Debe rechazar colecciones inválidas en seedData con InvalidMockCollectionError (400)', async () => {
      const mockService = new MockService();
      await assert.rejects(
        async () => await mockService.seedData({ qty: 5, collection: 'coleccion_inexistente' }),
        (err) =>
          err instanceof InvalidMockCollectionError &&
          err.statusCode === 400 &&
          err.code === 'INVALID_MOCK_COLLECTION'
      );
    });

    it('Debe capturar fallas durante la carga en MongoDB y lanzar MockSeedError (500) controlado', async () => {
      const mockService = new MockService();
      // Simulamos un fallo en la capa de persistencia (MongoDB caído o error de escritura)
      mockService.userRepository.createMany = async () => {
        throw new Error('MongoNetworkError: connection timed out');
      };

      await assert.rejects(
        async () => await mockService.seedData({ qty: 5, collection: 'usuarios' }),
        (err) =>
          err instanceof MockSeedError &&
          err.statusCode === 500 &&
          err.code === 'MOCK_SEED_FAILURE' &&
          err.details.collection === 'usuarios'
      );
    });
  });

  describe('4. Errores Personalizados en Servicios del Dominio (Users, Products, Orders, Deliveries)', () => {
    it('UserService debe lanzar InvalidIdError, UserNotFoundError e InvalidRoleError según corresponda', async () => {
      const userService = new UserService();

      // ID con formato inválido
      await assert.rejects(
        async () => await userService.getUserById('123'),
        (err) => err instanceof InvalidIdError && err.statusCode === 400
      );

      // Usuario inexistente
      userService.userRepository.getById = async () => null;
      await assert.rejects(
        async () => await userService.getUserById('65f1a2b3c4d5e6f7a8b9c0d1'),
        (err) => err instanceof UserNotFoundError && err.statusCode === 404 && err.code === 'USER_NOT_FOUND'
      );

      // Rol inválido
      await assert.rejects(
        async () =>
          await userService.createUser({
            nombre: 'Juan Perez',
            email: 'juan@test.com',
            rol: 'super_hacker',
          }),
        (err) => err instanceof InvalidRoleError && err.statusCode === 400 && err.code === 'INVALID_USER_ROLE'
      );
    });

    it('ProductService debe lanzar ProductNotFoundError, NegativeValueError e InvalidStateError', async () => {
      const productService = new ProductService();

      productService.productRepository.getById = async () => null;
      await assert.rejects(
        async () => await productService.getProductById('65f1a2b3c4d5e6f7a8b9c0d1'),
        (err) => err instanceof ProductNotFoundError && err.statusCode === 404
      );

      await assert.rejects(
        async () =>
          await productService.createProduct({
            title: 'Caja',
            description: 'Caja grande',
            price: -100,
            stock: 5,
            category: 'embalaje',
          }),
        (err) => err instanceof NegativeValueError && err.statusCode === 400 && err.code === 'NEGATIVE_VALUE'
      );

      await assert.rejects(
        async () => await productService.getAllProducts({ status: 'ROTO' }),
        (err) => err instanceof InvalidStateError && err.statusCode === 400 && err.code === 'INVALID_STATE'
      );
    });

    it('OrderService debe lanzar OrderNotFoundError, UserNotFoundError, InvalidStateError y NegativeValueError', async () => {
      const orderService = new OrderService();

      // Pedido no encontrado
      orderService.orderRepository.getById = async () => null;
      await assert.rejects(
        async () => await orderService.getOrderById('65f1a2b3c4d5e6f7a8b9c0d1'),
        (err) => err instanceof OrderNotFoundError && err.statusCode === 404 && err.code === 'ORDER_NOT_FOUND'
      );

      // Estado inválido en filtro
      await assert.rejects(
        async () => await orderService.getAllOrders({ estado: 'perdido_en_el_espacio' }),
        (err) => err instanceof InvalidStateError && err.statusCode === 400 && err.code === 'INVALID_STATE'
      );

      // Usuario cliente inexistente al crear pedido
      orderService.userRepository.getById = async () => null;
      await assert.rejects(
        async () =>
          await orderService.createOrder({
            cliente: '65f1a2b3c4d5e6f7a8b9c0d1',
            descripcion: 'Paquete express',
            total: 2500,
            direccionEntrega: 'Av. Siempre Viva 742',
          }),
        (err) => err instanceof UserNotFoundError && err.statusCode === 404 && err.code === 'USER_NOT_FOUND'
      );

      // Total negativo al crear pedido
      orderService.userRepository.getById = async () => ({ _id: '65f1a2b3c4d5e6f7a8b9c0d1', rol: 'cliente' });
      await assert.rejects(
        async () =>
          await orderService.createOrder({
            cliente: '65f1a2b3c4d5e6f7a8b9c0d1',
            descripcion: 'Paquete express',
            total: -500,
            direccionEntrega: 'Av. Siempre Viva 742',
          }),
        (err) => err instanceof NegativeValueError && err.statusCode === 400 && err.code === 'NEGATIVE_VALUE'
      );
    });

    it('DeliveryService debe lanzar DeliveryNotFoundError e InvalidStateError', async () => {
      const deliveryService = new DeliveryService();

      deliveryService.deliveryRepository.getById = async () => null;
      await assert.rejects(
        async () => await deliveryService.getDeliveryById('65f1a2b3c4d5e6f7a8b9c0d1'),
        (err) => err instanceof DeliveryNotFoundError && err.statusCode === 404 && err.code === 'DELIVERY_NOT_FOUND'
      );

      await assert.rejects(
        async () => await deliveryService.getAllDeliveries({ estado: 'estado_inexistente' }),
        (err) => err instanceof InvalidStateError && err.statusCode === 400 && err.code === 'INVALID_STATE'
      );
    });
  });

  describe('5. Integración HTTP con Express y Middleware Global', () => {
    it('Debe responder con la estructura uniforme del middleware ante errores en /api/mocks y rutas 404', async () => {
      const server = app.listen(0);
      const { port } = server.address();
      const baseUrl = `http://127.0.0.1:${port}`;

      try {
        // Caso A: Cantidad negativa en /api/mocks/users?qty=-3
        const negRes = await fetch(`${baseUrl}/api/mocks/users?qty=-3`);
        const negBody = await negRes.json();
        assert.equal(negRes.status, 400);
        assert.equal(negBody.success, false);
        assert.equal(negBody.error.code, 'NEGATIVE_VALUE');
        assert.equal(negBody.error.statusCode, 400);

        // Caso B: Cantidad inválida en /api/mocks/orders?qty=abc
        const invalidQtyRes = await fetch(`${baseUrl}/api/mocks/orders?qty=abc`);
        const invalidQtyBody = await invalidQtyRes.json();
        assert.equal(invalidQtyRes.status, 400);
        assert.equal(invalidQtyBody.success, false);
        assert.equal(invalidQtyBody.error.code, 'INVALID_MOCK_QUANTITY');

        // Caso C: Ruta no encontrada 404
        const notFoundRes = await fetch(`${baseUrl}/api/no-existe`);
        const notFoundBody = await notFoundRes.json();
        assert.equal(notFoundRes.status, 404);
        assert.equal(notFoundBody.success, false);
        assert.equal(notFoundBody.error.code, 'ROUTE_NOT_FOUND');
      } finally {
        server.close();
      }
    });
  });
});
