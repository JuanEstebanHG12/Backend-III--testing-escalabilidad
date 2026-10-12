import { DeliveryModel } from '../models/delivery.model.js';

/**
 * Capa Repository de Entregas:
 * Única encargada de interactuar con el modelo Delivery en MongoDB.
 * Encapsula la población de relaciones (pedido y repartidor).
 */
export class DeliveryRepository {
  /**
   * Obtiene todas las entregas con el pedido y el repartidor asignado.
   */
  async getAll(filters = {}) {
    return await DeliveryModel.find(filters)
      .populate('pedido')
      .populate('repartidor', 'nombre email rol')
      .select('-__v')
      .sort({ createdAt: -1 })
      .lean();
  }

  /**
   * Obtiene una entrega por ID con sus relaciones completas.
   */
  async getById(id) {
    return await DeliveryModel.findById(id)
      .populate('pedido')
      .populate('repartidor', 'nombre email rol')
      .select('-__v')
      .lean();
  }

  /**
   * Inserta una nueva entrega.
   */
  async create(deliveryData) {
    const delivery = await DeliveryModel.create(deliveryData);
    const deliveryObj = delivery.toObject();
    delete deliveryObj.__v;
    return deliveryObj;
  }

  /**
   * Inserta múltiples entregas en lote (para seed).
   */
  async createMany(deliveriesArray) {
    return await DeliveryModel.insertMany(deliveriesArray);
  }

  /**
   * Elimina una entrega por ID.
   */
  async delete(id) {
    return await DeliveryModel.findByIdAndDelete(id).select('-__v').lean();
  }

  /**
   * Limpia todas las entregas.
   */
  async deleteAll() {
    return await DeliveryModel.deleteMany({});
  }
}
