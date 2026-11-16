import { DeliveryService } from '../services/delivery.service.js';

/**
 * Capa Controller de Entregas (Deliveries):
 * Única puerta de entrada HTTP para la entidad Entregas.
 * Gestiona req y res y delega cualquier error al middleware global vía next(error).
 */
export class DeliveryController {
  constructor() {
    this.deliveryService = new DeliveryService();
  }

  /**
   * GET /api/deliveries
   */
  getAll = async (req, res, next) => {
    try {
      const deliveries = await this.deliveryService.getAllDeliveries(req.query);
      return res.status(200).json({
        success: true,
        data: deliveries,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/deliveries/:id
   */
  getById = async (req, res, next) => {
    try {
      const { id } = req.params;
      const delivery = await this.deliveryService.getDeliveryById(id);
      return res.status(200).json({
        success: true,
        data: delivery,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /api/deliveries
   */
  create = async (req, res, next) => {
    try {
      const newDelivery = await this.deliveryService.createDelivery(req.body);
      return res.status(201).json({
        success: true,
        message: 'Entrega creada exitosamente',
        data: newDelivery,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * PUT /api/deliveries/:id
   */
  update = async (req, res, next) => {
    try {
      const { id } = req.params;
      const updatedDelivery = await this.deliveryService.updateDelivery(id, req.body);
      return res.status(200).json({
        success: true,
        message: 'Entrega actualizada exitosamente',
        data: updatedDelivery,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * DELETE /api/deliveries/:id
   */
  delete = async (req, res, next) => {
    try {
      const { id } = req.params;
      await this.deliveryService.deleteDelivery(id);
      return res.status(200).json({
        success: true,
        message: 'Entrega eliminada exitosamente',
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /api/deliveries/:id/receipt
   */
  uploadReceipt = async (req, res, next) => {
    try {
      const { id } = req.params;
      const documentType =
        req.body?.documentType ??
        req.body?.tipoDocumento ??
        req.query?.documentType ??
        req.query?.tipoDocumento;

      const result = await this.deliveryService.uploadDeliveryReceipt(
        id,
        req.file,
        documentType
      );

      return res.status(201).json({
        success: true,
        message: 'Comprobante de entrega subido y asociado exitosamente',
        data: result.delivery,
        receipt: result.receipt,
      });
    } catch (error) {
      next(error);
    }
  };
}
