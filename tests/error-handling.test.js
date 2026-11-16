import { expect } from 'chai';
import request from 'supertest';
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
      expect(Object.isFrozen(ERROR_DICTIONARY)).to.be.true;
      expect(ERROR_DICTIONARY).to.include.all.keys(
        'USER_NOT_FOUND',
        'ORDER_NOT_FOUND',
        'PRODUCT_NOT_FOUND',
        'DELIVERY_NOT_FOUND',
        'INVALID_STATE',
        'INVALID_MOCK_QUANTITY',
        'NEGATIVE_VALUE',
        'MOCK_SEED_FAILURE'
      );
    });

    it('Debe instanciar errores personalizados con su código y statusCode del diccionario', () => {
      const userErr = new UserNotFoundError('65f1a2b3c4d5e6f7a8b9c0d1');
      expect(userErr).to.be.instanceOf(AppError);
      expect(userErr.code).to.equal('USER_NOT_FOUND');
      expect(userErr.statusCode).to.equal(404);

      const orderErr = new OrderNotFoundError('65f1a2b3c4d5e6f7a8b9c0d2');
      expect(orderErr.code).to.equal('ORDER_NOT_FOUND');
      expect(orderErr.statusCode).to.equal(404);

      const stateErr = new InvalidStateError('volando', ['pendiente', 'enviado'], 'pedido');
      expect(stateErr.code).to.equal('INVALID_STATE');
      expect(stateErr.statusCode).to.equal(400);

      const qtyErr = new InvalidMockQuantityError('abc');
      expect(qtyErr.code).to.equal('INVALID_MOCK_QUANTITY');
      expect(qtyErr.statusCode).to.equal(400);

      const negErr = new NegativeValueError('qty', -5);
      expect(negErr.code).to.equal('NEGATIVE_VALUE');
      expect(negErr.statusCode).to.equal(400);

      const seedErr = new MockSeedError('Error de conexión simulado');
      expect(seedErr.code).to.equal('MOCK_SEED_FAILURE');
      expect(seedErr.statusCode).to.equal(500);
    });
  });

  describe('2. Middleware Global de Errores y Estructura Uniforme', () => {
    it('Debe transformar errores de dominio en una estructura HTTP uniforme y predecible', () => {
      const domainError = new OrderNotFoundError('65f1a2b3c4d5e6f7a8b9c0d2');
      const { status, body } = runErrorMiddleware(domainError, {
        method: 'GET',
        originalUrl: '/api/orders/65f1a2b3c4d5e6f7a8b9c0d2',
      });

      expect(status).to.equal(404);
      expect(body.success).to.be.false;
      expect(body.message).to.be.a('string');
      expect(body.error).to.be.an('object');
      expect(body.error.code).to.equal('ORDER_NOT_FOUND');
      expect(body.error.name).to.equal('OrderNotFoundError');
      expect(body.error.statusCode).to.equal(404);
      expect(body.error.path).to.equal('/api/orders/65f1a2b3c4d5e6f7a8b9c0d2');
      expect(body.error.method).to.equal('GET');
      expect(body.error.timestamp).to.be.a('string');
    });

    it('Debe normalizar errores de Mongoose (CastError y clave duplicada 11000) a la misma estructura uniforme', () => {
      const castError = { name: 'CastError', path: '_id', value: 'id-invalido' };
      const castResult = runErrorMiddleware(castError);
      expect(castResult.status).to.equal(400);
      expect(castResult.body.error.code).to.equal('INVALID_OBJECT_ID');

      const duplicateKeyError = { code: 11000, keyValue: { email: 'repetido@test.com' } };
      const dupResult = runErrorMiddleware(duplicateKeyError);
      expect(dupResult.status).to.equal(409);
      expect(dupResult.body.error.code).to.equal('DUPLICATE_RESOURCE');
    });

    it('Debe transformar rutas inexistentes (RouteNotFoundError) con la estructura uniforme', () => {
      const notFoundError = new RouteNotFoundError('POST', '/api/ruta-inexistente');
      const { status, body } = runErrorMiddleware(notFoundError, {
        method: 'POST',
        originalUrl: '/api/ruta-inexistente',
      });

      expect(status).to.equal(404);
      expect(body.success).to.be.false;
      expect(body.error.code).to.equal('ROUTE_NOT_FOUND');
    });
  });

  describe('3. Validaciones y Manejo de Errores en el Módulo de Mocks', () => {
    it('Debe generar datos correctamente cuando qty es válido o por defecto', () => {
      const mockService = new MockService();
      const users = mockService.getSimulatedUsers(3);
      expect(users).to.have.lengthOf(3);
      expect(users[0]).to.include.all.keys('nombre', 'email', 'rol');
    });

    it('Debe rechazar valores negativos en qty con NegativeValueError (400)', () => {
      const mockService = new MockService();
      expect(() => mockService.getSimulatedUsers(-5)).to.throw(NegativeValueError);
      expect(() => mockService.getSimulatedOrders('-1')).to.throw(NegativeValueError);
    });

    it('Debe rechazar cantidades inválidas (0, texto, decimales, vacío o > 1000) con InvalidMockQuantityError (400)', () => {
      const mockService = new MockService();
      for (const invalidQty of [0, '0', 'abc', '3.5', '', null, 1500]) {
        expect(() => mockService.getSimulatedUsers(invalidQty)).to.throw(InvalidMockQuantityError);
      }
    });

    it('Debe rechazar colecciones inválidas en seedData con InvalidMockCollectionError (400)', async () => {
      const mockService = new MockService();
      let captured = null;
      try {
        await mockService.seedData({ qty: 5, collection: 'coleccion_inexistente' });
      } catch (err) {
        captured = err;
      }
      expect(captured).to.be.instanceOf(InvalidMockCollectionError);
      expect(captured.statusCode).to.equal(400);
    });

    it('Debe capturar fallas durante la carga en MongoDB y lanzar MockSeedError (500) controlado', async () => {
      const mockService = new MockService();
      mockService.userRepository.createMany = async () => {
        throw new Error('MongoNetworkError: connection timed out');
      };

      let captured = null;
      try {
        await mockService.seedData({ qty: 5, collection: 'usuarios' });
      } catch (err) {
        captured = err;
      }
      expect(captured).to.be.instanceOf(MockSeedError);
      expect(captured.statusCode).to.equal(500);
      expect(captured.code).to.equal('MOCK_SEED_FAILURE');
    });
  });

  describe('4. Errores Personalizados en Servicios del Dominio (Users, Products, Orders, Deliveries)', () => {
    it('UserService debe lanzar InvalidIdError, UserNotFoundError e InvalidRoleError según corresponda', async () => {
      const userService = new UserService();

      let idErr = null;
      try {
        await userService.getUserById('123');
      } catch (err) {
        idErr = err;
      }
      expect(idErr).to.be.instanceOf(InvalidIdError);

      userService.userRepository.getById = async () => null;
      let notFoundErr = null;
      try {
        await userService.getUserById('65f1a2b3c4d5e6f7a8b9c0d1');
      } catch (err) {
        notFoundErr = err;
      }
      expect(notFoundErr).to.be.instanceOf(UserNotFoundError);

      let roleErr = null;
      try {
        await userService.createUser({
          nombre: 'Juan Perez',
          email: 'juan@test.com',
          rol: 'super_hacker',
        });
      } catch (err) {
        roleErr = err;
      }
      expect(roleErr).to.be.instanceOf(InvalidRoleError);
    });

    it('ProductService, OrderService y DeliveryService deben lanzar sus errores de dominio correspondientes', async () => {
      const productService = new ProductService();
      productService.productRepository.getById = async () => null;

      let prodErr = null;
      try {
        await productService.getProductById('65f1a2b3c4d5e6f7a8b9c0d1');
      } catch (err) {
        prodErr = err;
      }
      expect(prodErr).to.be.instanceOf(ProductNotFoundError);

      const orderService = new OrderService();
      orderService.orderRepository.getById = async () => null;
      let orderErr = null;
      try {
        await orderService.getOrderById('65f1a2b3c4d5e6f7a8b9c0d1');
      } catch (err) {
        orderErr = err;
      }
      expect(orderErr).to.be.instanceOf(OrderNotFoundError);

      const deliveryService = new DeliveryService();
      deliveryService.deliveryRepository.getById = async () => null;
      let delivErr = null;
      try {
        await deliveryService.getDeliveryById('65f1a2b3c4d5e6f7a8b9c0d1');
      } catch (err) {
        delivErr = err;
      }
      expect(delivErr).to.be.instanceOf(DeliveryNotFoundError);
    });
  });

  describe('5. Integración con Supertest sin abrir puerto manualmente', () => {
    it('Debe responder con la estructura uniforme del middleware ante errores en /api/mocks y rutas 404', async () => {
      const negRes = await request(app).get('/api/mocks/users?qty=-3');
      expect(negRes.status).to.equal(400);
      expect(negRes.body.success).to.be.false;
      expect(negRes.body.error.code).to.equal('NEGATIVE_VALUE');

      const invalidQtyRes = await request(app).get('/api/mocks/orders?qty=abc');
      expect(invalidQtyRes.status).to.equal(400);
      expect(invalidQtyRes.body.error.code).to.equal('INVALID_MOCK_QUANTITY');

      const notFoundRes = await request(app).get('/api/no-existe');
      expect(notFoundRes.status).to.equal(404);
      expect(notFoundRes.body.error.code).to.equal('ROUTE_NOT_FOUND');
    });
  });
});
