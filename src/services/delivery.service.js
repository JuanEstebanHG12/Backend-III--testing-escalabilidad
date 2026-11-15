import { DeliveryRepository } from '../repositories/delivery.repository.js';
import { OrderRepository } from '../repositories/order.repository.js';
import { UserRepository } from '../repositories/user.repository.js';
import { DELIVERY_STATUS, USER_ROLES } from '../constants/index.js';
import { isValidObjectId } from '../utils/validators.util.js';
import {
  DeliveryNotFoundError,
  OrderNotFoundError,
  UserNotFoundError,
  InvalidStateError,
  InvalidRoleError,
  ValidationError,
  InvalidIdError,
  ERROR_DICTIONARY,
} from '../errors/index.js';

/**
 * Capa Service de Entregas (Deliveries):
 * Gestiona la lógica de negocio de entregas (asociación con pedido y repartidor válido, estados de entrega)
 * y lanza errores personalizados del dominio.
 */
export class DeliveryService {
  constructor() {
    this.deliveryRepository = new DeliveryRepository();
    this.orderRepository = new OrderRepository();
    this.userRepository = new UserRepository();
  }

  /**
   * Obtiene todas las entregas aplicando filtros opcionales de estado.
   */
  async getAllDeliveries(queryParams = {}) {
    const filters = {};
    const statusFilter = queryParams.estado || queryParams.status;

    if (statusFilter) {
      const validStates = Object.values(DELIVERY_STATUS);
      if (!validStates.includes(statusFilter)) {
        throw new InvalidStateError(statusFilter, validStates, 'entrega');
      }
      filters.estado = statusFilter;
    }

    return await this.deliveryRepository.getAll(filters);
  }

  /**
   * Obtiene una entrega por ID. Lanza DeliveryNotFoundError si no existe.
   */
  async getDeliveryById(id) {
    if (!isValidObjectId(id)) {
      throw new InvalidIdError(id, 'entrega');
    }

    const delivery = await this.deliveryRepository.getById(id);
    if (!delivery) {
      throw new DeliveryNotFoundError(id);
    }
    return delivery;
  }

  /**
   * Crea una nueva entrega verificando existencia del pedido y rol coherente del repartidor.
   */
  async createDelivery(deliveryData = {}) {
    if (!deliveryData || typeof deliveryData !== 'object') {
      throw new ValidationError(
        ERROR_DICTIONARY.MISSING_REQUIRED_FIELDS.message,
        { required: ['pedido', 'repartidor', 'direccion'] },
        ERROR_DICTIONARY.MISSING_REQUIRED_FIELDS.code
      );
    }

    const {
      codigoSeguimiento,
      pedido,
      repartidor,
      estado = DELIVERY_STATUS.ASIGNADA,
      fechaEstimada,
      direccion,
    } = deliveryData;

    if (!pedido || !repartidor || !direccion) {
      throw new ValidationError(
        'Los campos pedido, repartidor y direccion son obligatorios',
        { required: ['pedido', 'repartidor', 'direccion'] },
        ERROR_DICTIONARY.MISSING_REQUIRED_FIELDS.code
      );
    }

    if (!isValidObjectId(pedido)) {
      throw new InvalidIdError(pedido, 'pedido');
    }

    if (!isValidObjectId(repartidor)) {
      throw new InvalidIdError(repartidor, 'repartidor');
    }

    const existingOrder = await this.orderRepository.getById(pedido);
    if (!existingOrder) {
      throw new OrderNotFoundError(pedido);
    }

    const existingDriver = await this.userRepository.getById(repartidor);
    if (!existingDriver) {
      throw new UserNotFoundError(repartidor);
    }

    if (existingDriver.rol !== USER_ROLES.REPARTIDOR) {
      throw new InvalidRoleError(
        existingDriver.rol,
        [USER_ROLES.REPARTIDOR],
        `El usuario asignado ('${existingDriver.nombre}') tiene rol '${existingDriver.rol}', pero se requiere rol '${USER_ROLES.REPARTIDOR}'`
      );
    }

    const validStates = Object.values(DELIVERY_STATUS);
    if (!validStates.includes(estado)) {
      throw new InvalidStateError(estado, validStates, 'entrega');
    }

    const parsedDate = fechaEstimada ? new Date(fechaEstimada) : new Date(Date.now() + 86400000);
    if (Number.isNaN(parsedDate.getTime())) {
      throw new ValidationError('La fecha estimada proporcionada no es válida', {
        field: 'fechaEstimada',
        value: fechaEstimada,
      });
    }

    const trackingCode =
      codigoSeguimiento && String(codigoSeguimiento).trim()
        ? String(codigoSeguimiento).trim()
        : `ENT-${Date.now().toString(36).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;

    return await this.deliveryRepository.create({
      codigoSeguimiento: trackingCode,
      pedido,
      repartidor,
      estado,
      fechaEstimada: parsedDate,
      direccion: String(direccion).trim(),
    });
  }

  /**
   * Actualiza los datos o el estado de una entrega existente.
   */
  async updateDelivery(id, updateData = {}) {
    await this.getDeliveryById(id);

    if (!updateData || typeof updateData !== 'object' || Object.keys(updateData).length === 0) {
      throw new ValidationError('Debe proporcionar al menos un campo para actualizar la entrega');
    }

    const dataToUpdate = { ...updateData };

    if (dataToUpdate.status !== undefined && dataToUpdate.estado === undefined) {
      dataToUpdate.estado = dataToUpdate.status;
      delete dataToUpdate.status;
    }

    if (dataToUpdate.estado !== undefined) {
      const validStates = Object.values(DELIVERY_STATUS);
      if (!validStates.includes(dataToUpdate.estado)) {
        throw new InvalidStateError(dataToUpdate.estado, validStates, 'entrega');
      }
    }

    if (dataToUpdate.repartidor !== undefined) {
      if (!isValidObjectId(dataToUpdate.repartidor)) {
        throw new InvalidIdError(dataToUpdate.repartidor, 'repartidor');
      }
      const driver = await this.userRepository.getById(dataToUpdate.repartidor);
      if (!driver) {
        throw new UserNotFoundError(dataToUpdate.repartidor);
      }
      if (driver.rol !== USER_ROLES.REPARTIDOR) {
        throw new InvalidRoleError(
          driver.rol,
          [USER_ROLES.REPARTIDOR],
          `El usuario asignado tiene rol '${driver.rol}', pero se requiere rol '${USER_ROLES.REPARTIDOR}'`
        );
      }
    }

    return await this.deliveryRepository.update(id, dataToUpdate);
  }

  /**
   * Elimina una entrega por su ID tras verificar su existencia.
   */
  async deleteDelivery(id) {
    await this.getDeliveryById(id);
    return await this.deliveryRepository.delete(id);
  }
}
