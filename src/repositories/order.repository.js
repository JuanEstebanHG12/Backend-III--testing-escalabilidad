import { OrderModel } from '../models/order.model.js';

/**
 * Capa Repository de Pedidos:
 * Única encargada de interactuar con el modelo Order en MongoDB.
 * Encapsula la población de relaciones (cliente) y proyecciones de campos.
 */
export class OrderRepository {
  /**
   * Obtiene todos los pedidos con los datos básicos del cliente asociado.
   */
  async getAll(filters = {}) {
    return await OrderModel.find(filters)
      .populate('cliente', 'nombre email rol')
      .select('-__v')
      .sort({ createdAt: -1 })
      .lean();
  }

  /**
   * Obtiene un pedido por su ID con el cliente asociado.
   */
  async getById(id) {
    return await OrderModel.findById(id)
      .populate('cliente', 'nombre email rol')
      .select('-__v')
      .lean();
  }

  /**
   * Inserta un único pedido.
   */
  async create(orderData) {
    const order = await OrderModel.create(orderData);
    const orderObj = order.toObject();
    delete orderObj.__v;
    return orderObj;
  }

  /**
   * Inserta múltiples pedidos en lote (para seed).
   */
  async createMany(ordersArray) {
    return await OrderModel.insertMany(ordersArray);
  }

  /**
   * Elimina un pedido por ID.
   */
  async delete(id) {
    return await OrderModel.findByIdAndDelete(id).select('-__v').lean();
  }

  /**
   * Limpia todos los pedidos.
   */
  async deleteAll() {
    return await OrderModel.deleteMany({});
  }
}
