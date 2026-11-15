import { OrderService } from '../services/order.service.js';

/**
 * Capa Controller de Pedidos (Orders):
 * Única puerta de entrada HTTP para la entidad Pedidos.
 * Gestiona req y res y delega cualquier error al middleware global vía next(error).
 * NUNCA importa Mongoose.
 */
export class OrderController {
  constructor() {
    this.orderService = new OrderService();
  }

  /**
   * GET /api/orders
   */
  getAll = async (req, res, next) => {
    try {
      const orders = await this.orderService.getAllOrders(req.query);
      return res.status(200).json({
        success: true,
        data: orders,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/orders/:id
   */
  getById = async (req, res, next) => {
    try {
      const { id } = req.params;
      const order = await this.orderService.getOrderById(id);
      return res.status(200).json({
        success: true,
        data: order,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /api/orders
   */
  create = async (req, res, next) => {
    try {
      const newOrder = await this.orderService.createOrder(req.body);
      return res.status(201).json({
        success: true,
        message: 'Pedido creado exitosamente',
        data: newOrder,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * PUT /api/orders/:id
   */
  update = async (req, res, next) => {
    try {
      const { id } = req.params;
      const updatedOrder = await this.orderService.updateOrder(id, req.body);
      return res.status(200).json({
        success: true,
        message: 'Pedido actualizado exitosamente',
        data: updatedOrder,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * PATCH /api/orders/:id/status
   */
  updateStatus = async (req, res, next) => {
    try {
      const { id } = req.params;
      const estado = req.body?.estado ?? req.body?.status;
      const updatedOrder = await this.orderService.updateOrderStatus(id, estado);
      return res.status(200).json({
        success: true,
        message: 'Estado del pedido actualizado exitosamente',
        data: updatedOrder,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * DELETE /api/orders/:id
   */
  delete = async (req, res, next) => {
    try {
      const { id } = req.params;
      await this.orderService.deleteOrder(id);
      return res.status(200).json({
        success: true,
        message: 'Pedido eliminado exitosamente',
      });
    } catch (error) {
      next(error);
    }
  };
}
