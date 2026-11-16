import { expect } from 'chai';
import request from 'supertest';
import app from '../src/app.js';
import { swaggerSpec } from '../src/config/swagger.config.js';

describe('Pre-entrega Módulo 5 — Documentación de API con Swagger/OpenAPI', () => {
  describe('1. Información General, Tags y Schemas Reutilizables', () => {
    it('Debe contener información general completa (title, version, description, servers)', () => {
      expect(swaggerSpec.openapi).to.equal('3.0.3');
      expect(swaggerSpec.info.title).to.be.a('string').and.not.be.empty;
      expect(swaggerSpec.info.version).to.be.a('string').and.not.be.empty;
      expect(swaggerSpec.info.description).to.be.a('string').and.not.be.empty;
      expect(swaggerSpec.servers).to.be.an('array').with.lengthOf.at.least(1);
      expect(swaggerSpec.servers[0].url).to.include('http://localhost');
    });

    it('Debe agrupar la documentación en los tags requeridos: Users, Orders, Deliveries, Mocks, Logger', () => {
      const tagNames = swaggerSpec.tags.map((t) => t.name);
      for (const requiredTag of ['Users', 'Orders', 'Deliveries', 'Mocks', 'Logger']) {
        expect(tagNames).to.include(requiredTag);
      }
    });

    it('Debe incluir schemas reutilizables para usuario, pedido, entrega, ítem de pedido, respuesta exitosa y respuesta de error', () => {
      const schemas = swaggerSpec.components.schemas;
      expect(schemas).to.include.all.keys(
        'User',
        'Order',
        'OrderItem',
        'Delivery',
        'SuccessResponse',
        'ErrorResponse'
      );
    });
  });

  describe('2. Endpoints Documentados (Users, Orders, Deliveries, Mocks, Logger)', () => {
    it('Debe documentar todos los endpoints principales y coincidir con las rutas reales', () => {
      const paths = swaggerSpec.paths;

      expect(paths['/api/users']?.get).to.be.an('object');
      expect(paths['/api/users']?.post).to.be.an('object');
      expect(paths['/api/users/{id}']?.get).to.be.an('object');
      expect(paths['/api/users/{id}']?.put).to.be.an('object');
      expect(paths['/api/users/{id}']?.delete).to.be.an('object');

      expect(paths['/api/orders']?.get).to.be.an('object');
      expect(paths['/api/orders']?.post).to.be.an('object');
      expect(paths['/api/orders/{id}']?.get).to.be.an('object');
      expect(paths['/api/orders/{id}']?.put).to.be.an('object');
      expect(paths['/api/orders/{id}']?.delete).to.be.an('object');
      expect(paths['/api/orders/{id}/status']?.patch).to.be.an('object');

      expect(paths['/api/deliveries']?.get).to.be.an('object');
      expect(paths['/api/deliveries']?.post).to.be.an('object');
      expect(paths['/api/deliveries/{id}']?.get).to.be.an('object');
      expect(paths['/api/deliveries/{id}']?.put).to.be.an('object');
      expect(paths['/api/deliveries/{id}']?.delete).to.be.an('object');

      expect(paths['/api/mocks/users']?.get).to.be.an('object');
      expect(paths['/api/mocks/orders']?.get).to.be.an('object');
      expect(paths['/api/mocks/deliveries']?.get).to.be.an('object');
      expect(paths['/api/mocks/all']?.get).to.be.an('object');
      expect(paths['/api/mocks/seed']?.post).to.be.an('object');
      expect(paths['/api/mocks/clear']?.delete).to.be.an('object');

      expect(paths['/api/loggerTest']?.get).to.be.an('object');
      expect(paths['/api/loggerTest'].get.description.toLowerCase()).to.include('validación');
    });
  });

  describe('3. Exposición de Swagger UI en /api/docs y /api/docs.json con Supertest', () => {
    it('Debe servir la interfaz interactiva Swagger UI en GET /api/docs/ y el JSON en GET /api/docs.json', async () => {
      const uiRes = await request(app).get('/api/docs/');
      expect(uiRes.status).to.equal(200);
      expect(uiRes.text).to.include('swagger-ui');

      const jsonRes = await request(app).get('/api/docs.json');
      expect(jsonRes.status).to.equal(200);
      expect(jsonRes.body.openapi).to.equal('3.0.3');
      expect(jsonRes.body.components.schemas).to.have.property('OrderItem');
    });
  });
});
