import { UserRepository } from '../repositories/user.repository.js';
import { OrderRepository } from '../repositories/order.repository.js';
import { DeliveryRepository } from '../repositories/delivery.repository.js';
import { USER_ROLES } from '../constants/index.js';
import {
  generateMockUsers,
  generateMockOrders,
  generateMockDeliveries,
} from '../utils/mock.util.js';
import {
  AppError,
  InvalidMockQuantityError,
  NegativeValueError,
  InvalidMockCollectionError,
  MockSeedError,
} from '../errors/index.js';

const MAX_MOCK_QUANTITY = 1000;
const ALLOWED_COLLECTIONS = Object.freeze([
  'usuarios',
  'users',
  'pedidos',
  'orders',
  'entregas',
  'deliveries',
  'all',
  'completo',
]);

/**
 * Capa Service de Mocks:
 * Contiene la lógica para validar parámetros, generar datos simulados en memoria y persistirlos
 * de forma controlada en MongoDB a través de los Repositories.
 * NUNCA importa Mongoose directamente.
 */
export class MockService {
  constructor() {
    this.userRepository = new UserRepository();
    this.orderRepository = new OrderRepository();
    this.deliveryRepository = new DeliveryRepository();
  }

  /**
   * Valida que la cantidad (qty) recibida sea un número entero positivo dentro de límites seguros.
   * Lanza NegativeValueError ante números negativos e InvalidMockQuantityError ante formatos/cantidades inválidas.
   */
  validateMockQuantity(qty) {
    if (qty === undefined) {
      return 10;
    }

    if (
      qty === null ||
      typeof qty === 'boolean' ||
      Array.isArray(qty) ||
      (typeof qty === 'string' && qty.trim() === '')
    ) {
      throw new InvalidMockQuantityError(
        qty,
        'La cantidad de mocks (qty) proporcionada no es válida'
      );
    }

    const numericQty = Number(qty);

    if (Number.isNaN(numericQty) || !Number.isFinite(numericQty)) {
      throw new InvalidMockQuantityError(
        qty,
        `La cantidad de mocks ('${qty}') debe ser un valor numérico válido`
      );
    }

    if (numericQty < 0) {
      throw new NegativeValueError(
        'qty',
        numericQty,
        `No se permiten valores negativos para la cantidad de mocks (recibido: ${numericQty})`
      );
    }

    if (numericQty === 0) {
      throw new InvalidMockQuantityError(
        numericQty,
        'La cantidad de mocks debe ser mayor a 0'
      );
    }

    if (!Number.isInteger(numericQty)) {
      throw new InvalidMockQuantityError(
        qty,
        `La cantidad de mocks debe ser un número entero (recibido: ${qty})`
      );
    }

    if (numericQty > MAX_MOCK_QUANTITY) {
      throw new InvalidMockQuantityError(
        numericQty,
        `La cantidad solicitada (${numericQty}) excede el límite máximo permitido por operación (${MAX_MOCK_QUANTITY})`
      );
    }

    return numericQty;
  }

  /**
   * Valida la colección destino solicitada para la carga de datos de prueba.
   */
  validateCollection(collection) {
    if (collection === undefined || collection === null) {
      return 'usuarios';
    }

    if (typeof collection !== 'string' || !collection.trim()) {
      throw new InvalidMockCollectionError(collection);
    }

    const normalized = collection.trim().toLowerCase();
    if (!ALLOWED_COLLECTIONS.includes(normalized)) {
      throw new InvalidMockCollectionError(collection);
    }

    return normalized;
  }

  /**
   * Genera usuarios simulados en memoria sin guardarlos en la base de datos.
   * Formato compatible con el ejemplo del entregable: { nombre, email, rol }.
   */
  getSimulatedUsers(qty) {
    const count = this.validateMockQuantity(qty);
    const users = generateMockUsers(count);
    return users.map(({ nombre, email, rol }) => ({
      nombre,
      email,
      rol,
    }));
  }

  /**
   * Genera pedidos simulados en memoria sin guardarlos en la base de datos.
   */
  getSimulatedOrders(qty) {
    const count = this.validateMockQuantity(qty);
    return generateMockOrders(count);
  }

  /**
   * Genera entregas simuladas en memoria sin guardarlas en la base de datos.
   */
  getSimulatedDeliveries(qty) {
    const count = this.validateMockQuantity(qty);
    return generateMockDeliveries(count);
  }

  /**
   * Genera un ecosistema completo en memoria con relaciones coherentes:
   * Usuarios -> Pedidos (asociados a clientes) -> Entregas (asociadas a pedidos y repartidores).
   */
  getSimulatedAll(qty) {
    const count = this.validateMockQuantity(qty);
    const users = generateMockUsers(count);
    const clientIds = users
      .filter((u) => u.rol === USER_ROLES.CLIENTE)
      .map((_, idx) => `mock_client_${idx + 1}`);
    const driverIds = users
      .filter((u) => u.rol === USER_ROLES.REPARTIDOR)
      .map((_, idx) => `mock_driver_${idx + 1}`);

    const orders = generateMockOrders(count, clientIds);
    const orderIds = orders.map((_, idx) => `mock_order_${idx + 1}`);

    const deliveries = generateMockDeliveries(count, orderIds, driverIds);

    return {
      usuarios: users.map(({ nombre, email, rol }) => ({ nombre, email, rol })),
      pedidos: orders,
      entregas: deliveries,
    };
  }

  /**
   * Inserta registros de prueba en MongoDB de forma controlada.
   * Valida datos de entrada y captura cualquier falla durante la persistencia en MongoDB.
   */
  async seedData({ qty, collection } = {}) {
    const count = this.validateMockQuantity(qty);
    const normalizedCollection = this.validateCollection(collection);

    try {
      // 1. Caso usuarios (coincide con el ejemplo de la consigna: POST /api/mocks/seed?qty=10)
      if (normalizedCollection === 'usuarios' || normalizedCollection === 'users') {
        const mockUsers = generateMockUsers(count);
        const inserted = await this.userRepository.createMany(mockUsers);
        return {
          insertados: inserted.length,
          coleccion: 'usuarios',
        };
      }

      // 2. Caso pedidos
      if (normalizedCollection === 'pedidos' || normalizedCollection === 'orders') {
        let clients = await this.userRepository.getByRole(USER_ROLES.CLIENTE);

        // Si no hay clientes en la DB, creamos algunos primero para mantener integridad referencial
        if (clients.length === 0) {
          const seedClients = generateMockUsers(3).map((u) => ({
            ...u,
            rol: USER_ROLES.CLIENTE,
          }));
          clients = await this.userRepository.createMany(seedClients);
        }

        const clientIds = clients.map((c) => c._id);
        const mockOrders = generateMockOrders(count, clientIds);
        const inserted = await this.orderRepository.createMany(mockOrders);

        return {
          insertados: inserted.length,
          coleccion: 'pedidos',
        };
      }

      // 3. Caso entregas
      if (normalizedCollection === 'entregas' || normalizedCollection === 'deliveries') {
        let orders = await this.orderRepository.getAll();
        let drivers = await this.userRepository.getByRole(USER_ROLES.REPARTIDOR);

        // Si faltan pedidos o repartidores, los sembramos para garantizar relaciones válidas
        if (drivers.length === 0) {
          const seedDrivers = generateMockUsers(2).map((u) => ({
            ...u,
            rol: USER_ROLES.REPARTIDOR,
          }));
          drivers = await this.userRepository.createMany(seedDrivers);
        }

        if (orders.length === 0) {
          let clients = await this.userRepository.getByRole(USER_ROLES.CLIENTE);
          if (clients.length === 0) {
            clients = await this.userRepository.createMany(
              generateMockUsers(2).map((u) => ({ ...u, rol: USER_ROLES.CLIENTE }))
            );
          }
          orders = await this.orderRepository.createMany(
            generateMockOrders(
              count,
              clients.map((c) => c._id)
            )
          );
        }

        const orderIds = orders.map((o) => o._id);
        const driverIds = drivers.map((d) => d._id);
        const mockDeliveries = generateMockDeliveries(count, orderIds, driverIds);
        const inserted = await this.deliveryRepository.createMany(mockDeliveries);

        return {
          insertados: inserted.length,
          coleccion: 'entregas',
        };
      }

      // 4. Caso ecosistema completo ('all' o 'completo')
      const mockUsers = generateMockUsers(count);
      const insertedUsers = await this.userRepository.createMany(mockUsers);

      const clientIds = insertedUsers
        .filter((u) => u.rol === USER_ROLES.CLIENTE)
        .map((u) => u._id);
      const driverIds = insertedUsers
        .filter((u) => u.rol === USER_ROLES.REPARTIDOR)
        .map((u) => u._id);

      const mockOrders = generateMockOrders(count, clientIds);
      const insertedOrders = await this.orderRepository.createMany(mockOrders);

      const orderIds = insertedOrders.map((o) => o._id);
      const mockDeliveries = generateMockDeliveries(count, orderIds, driverIds);
      const insertedDeliveries = await this.deliveryRepository.createMany(mockDeliveries);

      const total =
        insertedUsers.length + insertedOrders.length + insertedDeliveries.length;

      return {
        insertados: total,
        coleccion: 'completo',
        detalle: {
          usuarios: insertedUsers.length,
          pedidos: insertedOrders.length,
          entregas: insertedDeliveries.length,
        },
      };
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }

      throw new MockSeedError(
        `Fallo durante la carga de datos simulados en MongoDB para la colección '${normalizedCollection}': ${error.message}`,
        {
          collection: normalizedCollection,
          requestedQty: count,
          reason: error.message,
        }
      );
    }
  }

  /**
   * Limpia datos de prueba en la base de datos de forma controlada.
   */
  async clearData() {
    try {
      await this.deliveryRepository.deleteAll();
      await this.orderRepository.deleteAll();
      await this.userRepository.deleteAll();
      return {
        success: true,
        mensaje:
          'Colecciones de prueba (usuarios, pedidos, entregas) limpiadas exitosamente.',
      };
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }

      throw new MockSeedError(
        `Fallo durante la limpieza de colecciones de prueba en MongoDB: ${error.message}`,
        {
          operation: 'clearData',
          reason: error.message,
        }
      );
    }
  }
}
