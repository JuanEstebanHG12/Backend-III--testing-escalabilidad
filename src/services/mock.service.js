import { UserRepository } from '../repositories/user.repository.js';
import { OrderRepository } from '../repositories/order.repository.js';
import { DeliveryRepository } from '../repositories/delivery.repository.js';
import { USER_ROLES } from '../constants/index.js';
import {
  generateMockUsers,
  generateMockOrders,
  generateMockDeliveries,
} from '../utils/mock.util.js';

/**
 * Capa Service de Mocks:
 * Contiene la lógica para generar datos simulados en memoria y para persistirlos
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
   * Genera usuarios simulados en memoria sin guardarlos en la base de datos.
   * Formato compatible con el ejemplo del entregable: { nombre, email, rol }.
   */
  getSimulatedUsers(qty = 10) {
    const count = Math.max(1, Number(qty) || 10);
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
  getSimulatedOrders(qty = 10) {
    const count = Math.max(1, Number(qty) || 10);
    return generateMockOrders(count);
  }

  /**
   * Genera entregas simuladas en memoria sin guardarlas en la base de datos.
   */
  getSimulatedDeliveries(qty = 10) {
    const count = Math.max(1, Number(qty) || 10);
    return generateMockDeliveries(count);
  }

  /**
   * Genera un ecosistema completo en memoria con relaciones coherentes:
   * Usuarios -> Pedidos (asociados a clientes) -> Entregas (asociadas a pedidos y repartidores).
   */
  getSimulatedAll(qty = 10) {
    const count = Math.max(1, Number(qty) || 10);
    const users = generateMockUsers(count);
    const clientIds = users.filter((u) => u.rol === USER_ROLES.CLIENTE).map((_, idx) => `mock_client_${idx + 1}`);
    const driverIds = users.filter((u) => u.rol === USER_ROLES.REPARTIDOR).map((_, idx) => `mock_driver_${idx + 1}`);

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
   * Soporta inserción por colección ('usuarios', 'pedidos', 'entregas') o 'all'.
   */
  async seedData({ qty = 10, collection = 'usuarios' }) {
    const count = Math.max(1, Number(qty) || 10);
    const normalizedCollection = (collection || 'usuarios').toLowerCase();

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
      // Buscamos clientes existentes en la base de datos
      let clients = await this.userRepository.getByRole(USER_ROLES.CLIENTE);

      // Si no hay clientes en la DB, creamos algunos primero para mantener integridad referencial
      if (clients.length === 0) {
        const seedClients = generateMockUsers(3).map((u) => ({ ...u, rol: USER_ROLES.CLIENTE }));
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
        const seedDrivers = generateMockUsers(2).map((u) => ({ ...u, rol: USER_ROLES.REPARTIDOR }));
        drivers = await this.userRepository.createMany(seedDrivers);
      }

      if (orders.length === 0) {
        let clients = await this.userRepository.getByRole(USER_ROLES.CLIENTE);
        if (clients.length === 0) {
          clients = await this.userRepository.createMany(
            generateMockUsers(2).map((u) => ({ ...u, rol: USER_ROLES.CLIENTE }))
          );
        }
        orders = await this.orderRepository.createMany(generateMockOrders(count, clients.map((c) => c._id)));
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
    if (normalizedCollection === 'all' || normalizedCollection === 'completo') {
      // A. Creamos usuarios (clientes y repartidores)
      const mockUsers = generateMockUsers(count);
      const insertedUsers = await this.userRepository.createMany(mockUsers);

      const clientIds = insertedUsers.filter((u) => u.rol === USER_ROLES.CLIENTE).map((u) => u._id);
      const driverIds = insertedUsers.filter((u) => u.rol === USER_ROLES.REPARTIDOR).map((u) => u._id);

      // B. Creamos pedidos vinculados a los clientes creados
      const mockOrders = generateMockOrders(count, clientIds);
      const insertedOrders = await this.orderRepository.createMany(mockOrders);

      // C. Creamos entregas vinculadas a los pedidos y repartidores creados
      const orderIds = insertedOrders.map((o) => o._id);
      const mockDeliveries = generateMockDeliveries(count, orderIds, driverIds);
      const insertedDeliveries = await this.deliveryRepository.createMany(mockDeliveries);

      const total = insertedUsers.length + insertedOrders.length + insertedDeliveries.length;

      return {
        insertados: total,
        coleccion: 'completo',
        detalle: {
          usuarios: insertedUsers.length,
          pedidos: insertedOrders.length,
          entregas: insertedDeliveries.length,
        },
      };
    }

    const error = new Error(`Colección no válida para seed: '${collection}'. Opciones: usuarios, pedidos, entregas, all.`);
    error.statusCode = 400;
    throw error;
  }

  /**
   * Limpia datos de prueba en la base de datos.
   */
  async clearData() {
    await this.deliveryRepository.deleteAll();
    await this.orderRepository.deleteAll();
    await this.userRepository.deleteAll();
    return {
      success: true,
      mensaje: 'Colecciones de prueba (usuarios, pedidos, entregas) limpiadas exitosamente.',
    };
  }
}
