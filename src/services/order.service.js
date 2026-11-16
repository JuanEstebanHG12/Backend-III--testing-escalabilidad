import { OrderRepository } from '../repositories/order.repository.js';
import { UserRepository } from '../repositories/user.repository.js';
import { ORDER_STATUS, ORDER_PRIORITY } from '../constants/index.js';
import { logger } from '../config/logger.config.js';
import { isValidObjectId } from '../utils/validators.util.js';
import {
  OrderNotFoundError,
  UserNotFoundError,
  InvalidStateError,
  InvalidPriorityError,
  NegativeValueError,
  DuplicateResourceError,
  ValidationError,
  InvalidIdError,
  ERROR_DICTIONARY,
} from '../errors/index.js';

/**
 * Capa Service de Pedidos (Orders):
 * Gestiona las reglas de negocio de pedidos (estados, prioridades, validación de cliente y totales),
 * registra eventos importantes con Winston y lanza errores personalizados del dominio.
 */
export class OrderService {
  constructor() {
    this.orderRepository = new OrderRepository();
    this.userRepository = new UserRepository();
  }

  /**
   * Obtiene todos los pedidos aplicando filtros validados de estado o prioridad.
   */
  async getAllOrders(queryParams = {}) {
    const filters = {};
    const statusFilter = queryParams.estado || queryParams.status;
    const priorityFilter = queryParams.prioridad || queryParams.priority;

    if (statusFilter) {
      const validStates = Object.values(ORDER_STATUS);
      if (!validStates.includes(statusFilter)) {
        throw new InvalidStateError(statusFilter, validStates, 'pedido');
      }
      filters.estado = statusFilter;
    }

    if (priorityFilter) {
      const validPriorities = Object.values(ORDER_PRIORITY);
      if (!validPriorities.includes(priorityFilter)) {
        throw new InvalidPriorityError(priorityFilter, validPriorities);
      }
      filters.prioridad = priorityFilter;
    }

    return await this.orderRepository.getAll(filters);
  }

  /**
   * Obtiene un pedido por su ID. Lanza OrderNotFoundError si no existe.
   */
  async getOrderById(id) {
    if (!isValidObjectId(id)) {
      throw new InvalidIdError(id, 'pedido');
    }

    const order = await this.orderRepository.getById(id);
    if (!order) {
      logger.warning(`Pedido no encontrado con ID: ${id}`);
      throw new OrderNotFoundError(id);
    }
    return order;
  }

  /**
   * Crea un nuevo pedido verificando existencia del usuario cliente, estado, prioridad y total.
   */
  async createOrder(orderData = {}) {
    if (!orderData || typeof orderData !== 'object') {
      throw new ValidationError(
        ERROR_DICTIONARY.MISSING_REQUIRED_FIELDS.message,
        { required: ['cliente', 'descripcion', 'total', 'direccionEntrega'] },
        ERROR_DICTIONARY.MISSING_REQUIRED_FIELDS.code
      );
    }

    const {
      codigo,
      cliente,
      descripcion,
      total,
      direccionEntrega,
      estado = ORDER_STATUS.PENDIENTE,
      prioridad = ORDER_PRIORITY.MEDIA,
    } = orderData;

    if (!cliente || !descripcion || total === undefined || total === null || total === '' || !direccionEntrega) {
      throw new ValidationError(
        'Los campos cliente, descripcion, total y direccionEntrega son obligatorios',
        { required: ['cliente', 'descripcion', 'total', 'direccionEntrega'] },
        ERROR_DICTIONARY.MISSING_REQUIRED_FIELDS.code
      );
    }

    if (!isValidObjectId(cliente)) {
      throw new InvalidIdError(cliente, 'cliente');
    }

    const existingClient = await this.userRepository.getById(cliente);
    if (!existingClient) {
      logger.warning(`Intento de crear pedido con usuario cliente inexistente (ID: ${cliente})`);
      throw new UserNotFoundError(cliente, `No se puede crear el pedido: el usuario cliente con ID '${cliente}' no existe`);
    }

    const numericTotal = Number(total);
    if (Number.isNaN(numericTotal) || !Number.isFinite(numericTotal)) {
      throw new ValidationError('El total del pedido debe ser un número válido', {
        field: 'total',
        value: total,
      });
    }

    if (numericTotal < 0) {
      throw new NegativeValueError('total', numericTotal, 'El total del pedido no puede ser negativo');
    }

    const validStates = Object.values(ORDER_STATUS);
    if (!validStates.includes(estado)) {
      throw new InvalidStateError(estado, validStates, 'pedido');
    }

    const validPriorities = Object.values(ORDER_PRIORITY);
    if (!validPriorities.includes(prioridad)) {
      throw new InvalidPriorityError(prioridad, validPriorities);
    }

    const orderCode =
      codigo && String(codigo).trim()
        ? String(codigo).trim()
        : `PED-${Date.now().toString(36).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;

    const existingOrder = await this.orderRepository.getByCodigo(orderCode);
    if (existingOrder) {
      throw new DuplicateResourceError(
        `El código de pedido '${orderCode}' ya se encuentra registrado`,
        { field: 'codigo', value: orderCode },
        ERROR_DICTIONARY.ORDER_CODE_EXISTS.code
      );
    }

    const createdOrder = await this.orderRepository.create({
      codigo: orderCode,
      cliente,
      descripcion: String(descripcion).trim(),
      total: numericTotal,
      direccionEntrega: String(direccionEntrega).trim(),
      estado,
      prioridad,
    });

    logger.info(`Pedido #${createdOrder.codigo} creado correctamente para el cliente ${cliente}`);
    return createdOrder;
  }

  /**
   * Actualiza los datos o el estado de un pedido existente.
   */
  async updateOrder(id, updateData = {}) {
    await this.getOrderById(id);

    if (!updateData || typeof updateData !== 'object' || Object.keys(updateData).length === 0) {
      throw new ValidationError('Debe proporcionar al menos un campo para actualizar el pedido');
    }

    const dataToUpdate = { ...updateData };

    if (dataToUpdate.status !== undefined && dataToUpdate.estado === undefined) {
      dataToUpdate.estado = dataToUpdate.status;
      delete dataToUpdate.status;
    }

    if (dataToUpdate.estado !== undefined) {
      const validStates = Object.values(ORDER_STATUS);
      if (!validStates.includes(dataToUpdate.estado)) {
        throw new InvalidStateError(dataToUpdate.estado, validStates, 'pedido');
      }
    }

    if (dataToUpdate.prioridad !== undefined) {
      const validPriorities = Object.values(ORDER_PRIORITY);
      if (!validPriorities.includes(dataToUpdate.prioridad)) {
        throw new InvalidPriorityError(dataToUpdate.prioridad, validPriorities);
      }
    }

    if (dataToUpdate.total !== undefined) {
      const numericTotal = Number(dataToUpdate.total);
      if (Number.isNaN(numericTotal) || !Number.isFinite(numericTotal)) {
        throw new ValidationError('El total del pedido debe ser un número válido', {
          field: 'total',
          value: dataToUpdate.total,
        });
      }
      if (numericTotal < 0) {
        throw new NegativeValueError('total', numericTotal, 'El total del pedido no puede ser negativo');
      }
      dataToUpdate.total = numericTotal;
    }

    if (dataToUpdate.cliente !== undefined) {
      if (!isValidObjectId(dataToUpdate.cliente)) {
        throw new InvalidIdError(dataToUpdate.cliente, 'cliente');
      }
      const existingClient = await this.userRepository.getById(dataToUpdate.cliente);
      if (!existingClient) {
        throw new UserNotFoundError(dataToUpdate.cliente);
      }
    }

    const updatedOrder = await this.orderRepository.update(id, dataToUpdate);
    logger.info(`Pedido #${updatedOrder?.codigo || id} actualizado correctamente`);
    return updatedOrder;
  }

  /**
   * Actualiza exclusivamente el estado de un pedido.
   */
  async updateOrderStatus(id, estado) {
    if (!estado) {
      throw new ValidationError(
        'Debe especificar el nuevo estado del pedido',
        { required: ['estado'] },
        ERROR_DICTIONARY.MISSING_REQUIRED_FIELDS.code
      );
    }
    return await this.updateOrder(id, { estado });
  }

  /**
   * Elimina un pedido por ID tras validar su existencia.
   */
  async deleteOrder(id) {
    await this.getOrderById(id);
    const deleted = await this.orderRepository.delete(id);
    logger.info(`Pedido con ID ${id} eliminado correctamente`);
    return deleted;
  }
}
