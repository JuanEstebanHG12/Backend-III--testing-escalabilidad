import { expect } from 'chai';
import request from 'supertest';
import app from '../src/app.js';
import config from '../src/config/env.config.js';
import {
  USER_ROLES,
  ORDER_STATUS,
  ORDER_PRIORITY,
  DELIVERY_STATUS,
} from '../src/constants/index.js';
import {
  setupTestDatabase,
  clearTestDatabase,
  teardownTestDatabase,
} from './test-db.helper.js';

/**
 * Helper para validar que la estructura de error devuelta por el middleware global
 * coincida con lo definido en el módulo de errores y documentado en Swagger.
 */
const assertErrorStructure = (res, expectedStatus, expectedCode) => {
  expect(res.status).to.equal(expectedStatus);
  expect(res.body).to.be.an('object');
  expect(res.body).to.have.property('success', false);
  expect(res.body).to.have.property('message').that.is.a('string').and.is.not.empty;
  expect(res.body).to.have.property('error').that.is.an('object');
  expect(res.body.error).to.have.property('code', expectedCode);
  expect(res.body.error).to.have.property('statusCode', expectedStatus);
  expect(res.body.error).to.have.property('name').that.is.a('string');
  expect(res.body.error).to.have.property('path').that.is.a('string');
  expect(res.body.error).to.have.property('method').that.is.a('string');
  expect(res.body.error).to.have.property('timestamp').that.is.a('string');
};

describe('Pre-entrega Módulo 6 — Testing Funcional con Mocha, Chai y Supertest', () => {
  before(async () => {
    await setupTestDatabase();
  });

  // Estrategia de limpieza antes de cada test para garantizar aislamiento e independencia total
  beforeEach(async () => {
    await clearTestDatabase();
  });

  after(async () => {
    await teardownTestDatabase();
  });

  describe('1. Separación del Entorno de Testing y Servidor Express', () => {
    it('Debe ejecutarse en el entorno NODE_ENV=test con URI de base de datos separada (_test)', () => {
      expect(config.NODE_ENV).to.equal('test');
      expect(config.IS_TEST).to.be.true;
      expect(config.MONGODB_URI).to.include('_test');
      expect(config.MONGODB_URI_TEST).to.include('_test');
    });

    it('GET / debe responder 200 con estructura exitosa sin levantar manualmente un puerto', async () => {
      const res = await request(app).get('/');
      expect(res.status).to.equal(200);
      expect(res.body).to.be.an('object');
      expect(res.body).to.have.property('success', true);
      expect(res.body).to.have.property('documentation', '/api/docs');
    });
  });

  describe('2. Endpoints de Usuarios (/api/users) — Casos Exitosos y Errores', () => {
    it('GET /api/users debe devolver un listado vacío inicialmente y luego los usuarios creados (sin password)', async () => {
      const emptyRes = await request(app).get('/api/users');
      expect(emptyRes.status).to.equal(200);
      expect(emptyRes.body).to.have.property('success', true);
      expect(emptyRes.body.data).to.be.an('array').with.lengthOf(0);

      const createRes = await request(app).post('/api/users').send({
        nombre: 'Lucía Fernández',
        email: 'lucia.fernandez@shipnow.com',
        password: 'claveSegura123',
        rol: USER_ROLES.CLIENTE,
      });

      expect(createRes.status).to.equal(201);
      expect(createRes.body).to.have.property('success', true);
      expect(createRes.body.data).to.be.an('object');
      expect(createRes.body.data).to.have.property('_id');
      expect(createRes.body.data).to.have.property('nombre', 'Lucía Fernández');
      expect(createRes.body.data).to.have.property('email', 'lucia.fernandez@shipnow.com');
      expect(createRes.body.data).to.have.property('rol', USER_ROLES.CLIENTE);
      expect(createRes.body.data).to.not.have.property('password');

      const listRes = await request(app).get('/api/users');
      expect(listRes.status).to.equal(200);
      expect(listRes.body.data).to.be.an('array').with.lengthOf(1);
      expect(listRes.body.data[0].email).to.equal('lucia.fernandez@shipnow.com');
    });

    it('GET /api/users/:id debe devolver el usuario por ID cuando existe', async () => {
      const created = await request(app).post('/api/users').send({
        nombre: 'Martín Gómez',
        email: 'martin.gomez@shipnow.com',
        rol: USER_ROLES.REPARTIDOR,
      });
      const userId = created.body.data._id;

      const res = await request(app).get(`/api/users/${userId}`);
      expect(res.status).to.equal(200);
      expect(res.body).to.have.property('success', true);
      expect(res.body.data).to.have.property('_id', userId);
      expect(res.body.data).to.have.property('rol', USER_ROLES.REPARTIDOR);
    });

    it('POST /api/users debe devolver 400 (MISSING_REQUIRED_FIELDS) cuando faltan datos obligatorios', async () => {
      const res = await request(app).post('/api/users').send({ nombre: 'Sin Email' });
      assertErrorStructure(res, 400, 'MISSING_REQUIRED_FIELDS');
    });

    it('POST /api/users debe devolver 409 (USER_ALREADY_EXISTS) al intentar registrar un email duplicado', async () => {
      await request(app).post('/api/users').send({
        nombre: 'Usuario Uno',
        email: 'duplicado@shipnow.com',
      });

      const dupRes = await request(app).post('/api/users').send({
        nombre: 'Usuario Dos',
        email: 'duplicado@shipnow.com',
      });

      assertErrorStructure(dupRes, 409, 'USER_ALREADY_EXISTS');
    });

    it('GET /api/users/:id debe devolver 404 (USER_NOT_FOUND) cuando el usuario no existe', async () => {
      const res = await request(app).get('/api/users/65f1a2b3c4d5e6f7a8b9c099');
      assertErrorStructure(res, 404, 'USER_NOT_FOUND');
    });
  });

  describe('3. Endpoints de Pedidos (/api/orders) — Creación, Consulta por ID, Cambio de Estado y Errores', () => {
    let clientUser = null;

    beforeEach(async () => {
      // Creamos un usuario cliente válido de forma controlada antes de cada prueba de pedidos
      const userRes = await request(app).post('/api/users').send({
        nombre: 'Cliente de Prueba',
        email: 'cliente.pedidos@shipnow.com',
        rol: USER_ROLES.CLIENTE,
      });
      clientUser = userRes.body.data;
    });

    it('POST /api/orders debe crear un pedido válido con ítems asociados al usuario cliente', async () => {
      const orderPayload = {
        cliente: clientUser._id,
        descripcion: 'Envío de equipamiento informático',
        items: [
          {
            nombre: 'Monitor 27 pulgadas',
            cantidad: 2,
            precioUnitario: 15000,
          },
        ],
        total: 30000,
        direccionEntrega: 'Av. Corrientes 1234, CABA',
        prioridad: ORDER_PRIORITY.ALTA,
      };

      const res = await request(app).post('/api/orders').send(orderPayload);
      expect(res.status).to.equal(201);
      expect(res.body).to.have.property('success', true);
      expect(res.body.data).to.be.an('object');
      expect(res.body.data).to.have.property('_id');
      expect(res.body.data).to.have.property('codigo').that.includes('PED-');
      expect(res.body.data).to.have.property('total', 30000);
      expect(res.body.data).to.have.property('estado', ORDER_STATUS.PENDIENTE);
      expect(res.body.data).to.have.property('prioridad', ORDER_PRIORITY.ALTA);
      expect(res.body.data.items).to.be.an('array').with.lengthOf(1);
      expect(res.body.data.items[0]).to.include({
        nombre: 'Monitor 27 pulgadas',
        cantidad: 2,
        precioUnitario: 15000,
      });
    });

    it('GET /api/orders y GET /api/orders/:id deben listar y consultar un pedido existente con estructura completa', async () => {
      const created = await request(app).post('/api/orders').send({
        cliente: clientUser._id,
        descripcion: 'Paquete estándar',
        total: 4500,
        direccionEntrega: 'Calle San Martín 450',
      });
      const orderId = created.body.data._id;

      const listRes = await request(app).get('/api/orders');
      expect(listRes.status).to.equal(200);
      expect(listRes.body).to.have.property('success', true);
      expect(listRes.body.data).to.be.an('array').with.lengthOf(1);

      const detailRes = await request(app).get(`/api/orders/${orderId}`);
      expect(detailRes.status).to.equal(200);
      expect(detailRes.body).to.have.property('success', true);
      expect(detailRes.body.data).to.have.property('_id', orderId);
      expect(detailRes.body.data).to.have.property('descripcion', 'Paquete estándar');
    });

    it('PATCH /api/orders/:id/status debe actualizar correctamente el estado del pedido cuando es válido', async () => {
      const created = await request(app).post('/api/orders').send({
        cliente: clientUser._id,
        descripcion: 'Pedido para cambio de estado',
        total: 8000,
        direccionEntrega: 'Av. Belgrano 900',
      });
      const orderId = created.body.data._id;

      const patchRes = await request(app)
        .patch(`/api/orders/${orderId}/status`)
        .send({ estado: ORDER_STATUS.ENVIADO });

      expect(patchRes.status).to.equal(200);
      expect(patchRes.body).to.have.property('success', true);
      expect(patchRes.body.data).to.have.property('estado', ORDER_STATUS.ENVIADO);
    });

    it('PATCH /api/orders/:id/status debe devolver 400 (INVALID_STATE) ante un estado inválido', async () => {
      const created = await request(app).post('/api/orders').send({
        cliente: clientUser._id,
        descripcion: 'Pedido estado inválido',
        total: 8000,
        direccionEntrega: 'Av. Belgrano 900',
      });
      const orderId = created.body.data._id;

      const patchRes = await request(app)
        .patch(`/api/orders/${orderId}/status`)
        .send({ estado: 'estado_inexistente' });

      assertErrorStructure(patchRes, 400, 'INVALID_STATE');
    });

    it('POST /api/orders debe devolver 400 (MISSING_REQUIRED_FIELDS) con datos incompletos', async () => {
      const res = await request(app).post('/api/orders').send({
        cliente: clientUser._id,
        descripcion: 'Falta total y dirección',
      });
      assertErrorStructure(res, 400, 'MISSING_REQUIRED_FIELDS');
    });

    it('POST /api/orders debe devolver 404 (USER_NOT_FOUND) si el usuario cliente no existe', async () => {
      const res = await request(app).post('/api/orders').send({
        cliente: '65f1a2b3c4d5e6f7a8b9c088',
        descripcion: 'Pedido sin cliente real',
        total: 3000,
        direccionEntrega: 'Av. Siempre Viva 742',
      });
      assertErrorStructure(res, 404, 'USER_NOT_FOUND');
    });

    it('GET /api/orders/:id debe devolver 404 (ORDER_NOT_FOUND) cuando el pedido no existe', async () => {
      const res = await request(app).get('/api/orders/65f1a2b3c4d5e6f7a8b9c077');
      assertErrorStructure(res, 404, 'ORDER_NOT_FOUND');
    });
  });

  describe('4. Endpoints de Mocks (/api/mocks) — Generación en Memoria, Seeding y Validación de Errores', () => {
    it('GET /api/mocks/users?qty=3 y GET /api/mocks/orders?qty=2 deben generar datos válidos en memoria', async () => {
      const usersRes = await request(app).get('/api/mocks/users?qty=3');
      expect(usersRes.status).to.equal(200);
      expect(usersRes.body).to.be.an('array').with.lengthOf(3);
      expect(usersRes.body[0]).to.include.all.keys('nombre', 'email', 'rol');

      const ordersRes = await request(app).get('/api/mocks/orders?qty=2');
      expect(ordersRes.status).to.equal(200);
      expect(ordersRes.body).to.be.an('array').with.lengthOf(2);
      expect(ordersRes.body[0]).to.include.all.keys(
        'codigo',
        'cliente',
        'descripcion',
        'items',
        'total',
        'direccionEntrega',
        'estado',
        'prioridad'
      );
    });

    it('POST /api/mocks/seed y DELETE /api/mocks/clear deben sembrar y limpiar datos de prueba de forma controlada', async () => {
      const seedRes = await request(app)
        .post('/api/mocks/seed')
        .send({ qty: 3, collection: 'all' });

      expect(seedRes.status).to.equal(201);
      expect(seedRes.body).to.have.property('insertados', 9);
      expect(seedRes.body).to.have.property('coleccion', 'completo');
      expect(seedRes.body.detalle).to.deep.equal({
        usuarios: 3,
        pedidos: 3,
        entregas: 3,
      });

      const usersAfterSeed = await request(app).get('/api/users');
      expect(usersAfterSeed.body.data).to.be.an('array').with.lengthOf(3);

      const clearRes = await request(app).delete('/api/mocks/clear');
      expect(clearRes.status).to.equal(200);
      expect(clearRes.body).to.have.property('success', true);

      const usersAfterClear = await request(app).get('/api/users');
      expect(usersAfterClear.body.data).to.be.an('array').with.lengthOf(0);
    });

    it('Debe devolver 400 (NEGATIVE_VALUE y INVALID_MOCK_QUANTITY) ante cantidades inválidas en mocks', async () => {
      const negRes = await request(app).get('/api/mocks/users?qty=-4');
      assertErrorStructure(negRes, 400, 'NEGATIVE_VALUE');

      const zeroRes = await request(app).get('/api/mocks/orders?qty=0');
      assertErrorStructure(zeroRes, 400, 'INVALID_MOCK_QUANTITY');

      const textRes = await request(app).post('/api/mocks/seed?qty=invalido');
      assertErrorStructure(textRes, 400, 'INVALID_MOCK_QUANTITY');

      const collectionRes = await request(app)
        .post('/api/mocks/seed')
        .send({ qty: 5, collection: 'tabla_inexistente' });
      assertErrorStructure(collectionRes, 400, 'INVALID_MOCK_COLLECTION');
    });
  });

  describe('5. Endpoints de Entregas (/api/deliveries) y Productos (/api/products)', () => {
    it('POST /api/deliveries debe crear una entrega vinculada a un pedido y un repartidor válido y rechazar roles inválidos', async () => {
      const clientRes = await request(app).post('/api/users').send({
        nombre: 'Cliente Entrega',
        email: 'cliente.entrega@shipnow.com',
        rol: USER_ROLES.CLIENTE,
      });
      const driverRes = await request(app).post('/api/users').send({
        nombre: 'Repartidor Oficial',
        email: 'repartidor.oficial@shipnow.com',
        rol: USER_ROLES.REPARTIDOR,
      });

      const orderRes = await request(app).post('/api/orders').send({
        cliente: clientRes.body.data._id,
        descripcion: 'Paquete con seguimiento',
        total: 6000,
        direccionEntrega: 'Av. Santa Fe 3200',
      });

      const deliveryRes = await request(app).post('/api/deliveries').send({
        pedido: orderRes.body.data._id,
        repartidor: driverRes.body.data._id,
        direccion: 'Av. Santa Fe 3200',
      });

      expect(deliveryRes.status).to.equal(201);
      expect(deliveryRes.body).to.have.property('success', true);
      expect(deliveryRes.body.data).to.have.property('estado', DELIVERY_STATUS.ASIGNADA);

      // Si se intenta asignar un usuario con rol 'cliente' como repartidor debe fallar con 400 (INVALID_USER_ROLE)
      const invalidDriverRes = await request(app).post('/api/deliveries').send({
        pedido: orderRes.body.data._id,
        repartidor: clientRes.body.data._id,
        direccion: 'Av. Santa Fe 3200',
      });
      assertErrorStructure(invalidDriverRes, 400, 'INVALID_USER_ROLE');
    });

    it('POST /api/products y GET /api/products/:id deben gestionar productos y responder 400 ante precios negativos', async () => {
      const prodRes = await request(app).post('/api/products').send({
        title: 'Sobre Acolchado Mediano',
        description: 'Sobre con burbujas protectoras',
        price: 1200,
        stock: 25,
        category: 'embalaje',
      });

      expect(prodRes.status).to.equal(201);
      expect(prodRes.body.data).to.have.property('status', 'AVAILABLE');

      const negPriceRes = await request(app).post('/api/products').send({
        title: 'Producto Inválido',
        description: 'Precio negativo',
        price: -100,
        stock: 10,
        category: 'embalaje',
      });
      assertErrorStructure(negPriceRes, 400, 'NEGATIVE_VALUE');
    });
  });

  describe('6. Endpoint de Logger, Ruta de Swagger y Rutas Inexistentes (404)', () => {
    it('GET /api/loggerTest debe responder 200 y confirmar la prueba de los 6 niveles de Winston', async () => {
      const res = await request(app).get('/api/loggerTest');
      expect(res.status).to.equal(200);
      expect(res.body).to.have.property('success', true);
      expect(res.body).to.have.property('testedLevels').that.deep.equals([
        'fatal',
        'error',
        'warning',
        'info',
        'http',
        'debug',
      ]);
      expect(res.body).to.have.property('files').that.is.an('object');
    });

    it('GET /api/docs/ y GET /api/docs.json deben exponer Swagger UI y la especificación OpenAPI 3.0.3', async () => {
      const uiRes = await request(app).get('/api/docs/');
      expect(uiRes.status).to.equal(200);
      expect(uiRes.text).to.include('swagger-ui');

      const jsonRes = await request(app).get('/api/docs.json');
      expect(jsonRes.status).to.equal(200);
      expect(jsonRes.body).to.have.property('openapi', '3.0.3');
      expect(jsonRes.body.components.schemas).to.include.all.keys(
        'User',
        'Order',
        'OrderItem',
        'Delivery',
        'SuccessResponse',
        'ErrorResponse'
      );
    });

    it('Cualquier ruta inexistente debe devolver 404 (ROUTE_NOT_FOUND) con el formato de error uniforme', async () => {
      const res = await request(app).get('/api/ruta-que-no-existe');
      assertErrorStructure(res, 404, 'ROUTE_NOT_FOUND');
    });
  });
});
