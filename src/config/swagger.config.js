import swaggerUi from 'swagger-ui-express';
import config from './env.config.js';
import {
  swaggerPaths,
  swaggerSchemas,
  swaggerErrorResponses,
} from '../docs/index.js';

/**
 * Especificación OpenAPI 3.0.3 centralizada de ShipNow API.
 * Mantiene la configuración de Swagger completamente desacoplada de la lógica de rutas.
 */
export const swaggerSpec = Object.freeze({
  openapi: '3.0.3',
  info: {
    title: 'ShipNow API — Plataforma de Gestión Logística y Envíos',
    version: '1.0.0',
    description:
      'API RESTful de ShipNow estructurada en arquitectura de 3 capas (Controller, Service, Repository). ' +
      'Su propósito es gestionar integralmente el ciclo logístico de envíos: usuarios (clientes, repartidores y administradores), ' +
      'catálogo de productos, creación y seguimiento de pedidos con sus ítems, asignación de entregas a repartidores, ' +
      'generación controlada de datos de prueba (Mocks y Seeding), manejo centralizado de errores del dominio y monitoreo mediante Winston Logger.',
    contact: {
      name: 'Equipo de Ingeniería Backend — ShipNow',
    },
  },
  servers: [
    {
      url: `http://localhost:${config.PORT}`,
      description: `Servidor local de desarrollo (${config.NODE_ENV})`,
    },
  ],
  tags: [
    {
      name: 'Users',
      description: 'Gestión de usuarios del sistema (clientes, repartidores y administradores)',
    },
    {
      name: 'Orders',
      description: 'Gestión de pedidos logísticos, ítems de pedido, prioridades y cambios de estado',
    },
    {
      name: 'Deliveries',
      description: 'Gestión de entregas logísticas vinculadas a pedidos y repartidores',
    },
    {
      name: 'Mocks',
      description: 'Generación de datos simulados en memoria y carga controlada de prueba en MongoDB',
    },
    {
      name: 'Logger',
      description: 'Herramienta interna de validación y diagnóstico del sistema de logs (Winston)',
    },
    {
      name: 'Products',
      description: 'Gestión del catálogo de productos e inventario de ShipNow',
    },
  ],
  paths: swaggerPaths,
  components: {
    schemas: swaggerSchemas,
    responses: swaggerErrorResponses,
  },
});

export const swaggerUiOptions = {
  explorer: true,
  customSiteTitle: 'ShipNow API — Documentación Interactiva (Swagger UI)',
};

export { swaggerUi };
export default swaggerSpec;
