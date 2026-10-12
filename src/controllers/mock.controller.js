import { MockService } from '../services/mock.service.js';

/**
 * Capa Controller de Mocks:
 * Única puerta de entrada HTTP para la generación y sembrado de mocks.
 * Extrae parámetros (query, body), llama al MockService y retorna los datos y códigos HTTP apropiados.
 * NUNCA interactúa con Mongoose directamente.
 */
export class MockController {
  constructor() {
    this.mockService = new MockService();
  }

  /**
   * GET /api/mocks/users?qty=2
   * Devuelve datos de usuarios simulados sin guardarlos en la base de datos.
   */
  getMockUsers = async (req, res, next) => {
    try {
      const { qty } = req.query;
      const users = this.mockService.getSimulatedUsers(qty);
      return res.status(200).json(users);
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/mocks/orders?qty=5
   * Devuelve pedidos simulados en memoria sin guardarlos en la base de datos.
   */
  getMockOrders = async (req, res, next) => {
    try {
      const { qty } = req.query;
      const orders = this.mockService.getSimulatedOrders(qty);
      return res.status(200).json(orders);
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/mocks/deliveries?qty=5
   * Devuelve entregas simuladas en memoria sin guardarlas en la base de datos.
   */
  getMockDeliveries = async (req, res, next) => {
    try {
      const { qty } = req.query;
      const deliveries = this.mockService.getSimulatedDeliveries(qty);
      return res.status(200).json(deliveries);
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/mocks/all?qty=5
   * Devuelve un conjunto completo simulado en memoria con relaciones lógicas.
   */
  getMockAll = async (req, res, next) => {
    try {
      const { qty } = req.query;
      const data = this.mockService.getSimulatedAll(qty);
      return res.status(200).json(data);
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /api/mocks/seed?qty=10&collection=usuarios
   * Inserta registros simulados en MongoDB de forma controlada.
   */
  seedData = async (req, res, next) => {
    try {
      // Tomamos qty y collection tanto de query params como del body con fallback seguro
      const body = req.body || {};
      const qty = req.query.qty || body.qty || 10;
      const collection = req.query.collection || body.collection || 'usuarios';

      const result = await this.mockService.seedData({ qty, collection });
      return res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  };

  /**
   * DELETE /api/mocks/clear
   * Limpia las colecciones de prueba.
   */
  clearData = async (req, res, next) => {
    try {
      const result = await this.mockService.clearData();
      return res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };
}
