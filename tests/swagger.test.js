import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import app from '../src/app.js';
import { swaggerSpec } from '../src/config/swagger.config.js';

describe('Pre-entrega Módulo 5 — Documentación de API con Swagger/OpenAPI', () => {
  describe('1. Información General, Tags y Schemas Reutilizables', () => {
    it('Debe contener información general completa (title, version, description, servers)', () => {
      assert.equal(swaggerSpec.openapi, '3.0.3');
      assert.ok(swaggerSpec.info.title);
      assert.ok(swaggerSpec.info.version);
      assert.ok(swaggerSpec.info.description);
      assert.ok(Array.isArray(swaggerSpec.servers));
      assert.ok(swaggerSpec.servers.length >= 1);
      assert.ok(swaggerSpec.servers[0].url.includes('http://localhost'));
    });

    it('Debe agrupar la documentación en los tags requeridos: Users, Orders, Deliveries, Mocks, Logger', () => {
      const tagNames = swaggerSpec.tags.map((t) => t.name);
      for (const requiredTag of ['Users', 'Orders', 'Deliveries', 'Mocks', 'Logger']) {
        assert.equal(
          tagNames.includes(requiredTag),
          true,
          `El tag '${requiredTag}' debe estar definido en swaggerSpec.tags`
        );
      }
    });

    it('Debe incluir schemas reutilizables para usuario, pedido, entrega, ítem de pedido, respuesta exitosa y respuesta de error', () => {
      const schemas = swaggerSpec.components.schemas;
      assert.ok(schemas.User, 'Debe existir schema User (usuario)');
      assert.ok(schemas.Order, 'Debe existir schema Order (pedido)');
      assert.ok(schemas.OrderItem, 'Debe existir schema OrderItem (ítem de pedido)');
      assert.ok(schemas.Delivery, 'Debe existir schema Delivery (entrega)');
      assert.ok(schemas.SuccessResponse, 'Debe existir schema SuccessResponse (respuesta exitosa)');
      assert.ok(schemas.ErrorResponse, 'Debe existir schema ErrorResponse (respuesta de error)');
    });
  });

  describe('2. Endpoints Documentados (Users, Orders, Deliveries, Mocks, Logger)', () => {
    it('Debe documentar todos los endpoints principales y coincidir con las rutas reales', () => {
      const paths = swaggerSpec.paths;

      // Users
      assert.ok(paths['/api/users']?.get);
      assert.ok(paths['/api/users']?.post);
      assert.ok(paths['/api/users/{id}']?.get);
      assert.ok(paths['/api/users/{id}']?.put);
      assert.ok(paths['/api/users/{id}']?.delete);

      // Orders
      assert.ok(paths['/api/orders']?.get);
      assert.ok(paths['/api/orders']?.post);
      assert.ok(paths['/api/orders/{id}']?.get);
      assert.ok(paths['/api/orders/{id}']?.put);
      assert.ok(paths['/api/orders/{id}']?.delete);
      assert.ok(paths['/api/orders/{id}/status']?.patch);

      // Deliveries
      assert.ok(paths['/api/deliveries']?.get);
      assert.ok(paths['/api/deliveries']?.post);
      assert.ok(paths['/api/deliveries/{id}']?.get);
      assert.ok(paths['/api/deliveries/{id}']?.put);
      assert.ok(paths['/api/deliveries/{id}']?.delete);

      // Mocks
      assert.ok(paths['/api/mocks/users']?.get);
      assert.ok(paths['/api/mocks/orders']?.get);
      assert.ok(paths['/api/mocks/deliveries']?.get);
      assert.ok(paths['/api/mocks/all']?.get);
      assert.ok(paths['/api/mocks/seed']?.post);
      assert.ok(paths['/api/mocks/clear']?.delete);

      // Logger
      assert.ok(paths['/api/loggerTest']?.get);
      assert.equal(
        paths['/api/loggerTest'].get.description.toLowerCase().includes('validación'),
        true,
        'La documentación de /api/loggerTest debe aclarar que es una herramienta de validación'
      );
    });
  });

  describe('3. Exposición de Swagger UI en /api/docs y /api/docs.json', () => {
    it('Debe servir la interfaz interactiva Swagger UI en GET /api/docs/ y el JSON en GET /api/docs.json', async () => {
      const server = app.listen(0);
      const { port } = server.address();
      const baseUrl = `http://127.0.0.1:${port}`;

      try {
        const uiRes = await fetch(`${baseUrl}/api/docs/`);
        const uiHtml = await uiRes.text();
        assert.equal(uiRes.status, 200);
        assert.equal(uiHtml.includes('swagger-ui'), true);

        const jsonRes = await fetch(`${baseUrl}/api/docs.json`);
        const jsonSpec = await jsonRes.json();
        assert.equal(jsonRes.status, 200);
        assert.equal(jsonSpec.openapi, '3.0.3');
        assert.ok(jsonSpec.components.schemas.OrderItem);
      } finally {
        server.close();
      }
    });
  });
});
