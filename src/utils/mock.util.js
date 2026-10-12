import { fakerES_MX as faker } from '@faker-js/faker';
import {
  USER_ROLES,
  ORDER_STATUS,
  ORDER_PRIORITY,
  DELIVERY_STATUS,
} from '../constants/index.js';

/**
 * Generador de datos simulados (mocks) para ShipNow.
 * Utiliza Faker en español y las constantes inmutables del dominio.
 */

/**
 * Genera un usuario simulado.
 */
export const generateMockUser = (customRole = null) => {
  // Solo asignamos roles válidos de la constante
  const validRoles = [USER_ROLES.CLIENTE, USER_ROLES.REPARTIDOR];
  const rol = customRole || faker.helpers.arrayElement(validRoles);

  const firstName = faker.person.firstName();
  const lastName = faker.person.lastName();
  const nombre = `${firstName} ${lastName}`;
  const cleanFirst = firstName.toLowerCase().replace(/[^a-z]/g, '');
  const cleanLast = lastName.toLowerCase().replace(/[^a-z]/g, '');
  const email = `${cleanFirst}.${cleanLast}${faker.number.int({ min: 10, max: 999 })}@test.com`;

  return {
    nombre,
    email,
    password: 'password123',
    rol,
  };
};

/**
 * Genera un lote de usuarios simulados.
 */
export const generateMockUsers = (qty = 10) => {
  const users = [];
  for (let i = 0; i < qty; i++) {
    // Alternamos para asegurar que haya tanto clientes como repartidores
    const role = i % 3 === 0 ? USER_ROLES.REPARTIDOR : USER_ROLES.CLIENTE;
    users.push(generateMockUser(role));
  }
  return users;
};

/**
 * Genera un pedido simulado asociado a un cliente.
 */
export const generateMockOrder = (clienteId = null) => {
  const idCliente = clienteId || faker.database.mongodbObjectId();

  return {
    codigo: `PED-${faker.string.alphanumeric({ length: 6, casing: 'upper' })}`,
    cliente: idCliente,
    descripcion: `${faker.commerce.productAdjective()} ${faker.commerce.product()}`,
    total: Number(faker.commerce.price({ min: 1500, max: 50000, dec: 0 })),
    direccionEntrega: `${faker.location.streetAddress()}, ${faker.location.city()}`,
    estado: faker.helpers.arrayElement(Object.values(ORDER_STATUS)),
    prioridad: faker.helpers.arrayElement(Object.values(ORDER_PRIORITY)),
  };
};

/**
 * Genera un lote de pedidos simulados.
 */
export const generateMockOrders = (qty = 10, clienteIds = []) => {
  const orders = [];
  for (let i = 0; i < qty; i++) {
    const clienteId = clienteIds.length > 0 ? faker.helpers.arrayElement(clienteIds) : null;
    orders.push(generateMockOrder(clienteId));
  }
  return orders;
};

/**
 * Genera una entrega simulada asociada a un pedido y a un repartidor.
 */
export const generateMockDelivery = (pedidoId = null, repartidorId = null) => {
  const idPedido = pedidoId || faker.database.mongodbObjectId();
  const idRepartidor = repartidorId || faker.database.mongodbObjectId();

  return {
    codigoSeguimiento: `ENT-${faker.string.alphanumeric({ length: 6, casing: 'upper' })}`,
    pedido: idPedido,
    repartidor: idRepartidor,
    estado: faker.helpers.arrayElement(Object.values(DELIVERY_STATUS)),
    fechaEstimada: faker.date.soon({ days: 4 }),
    direccion: `${faker.location.streetAddress()}, ${faker.location.city()}`,
  };
};

/**
 * Genera un lote de entregas simuladas.
 */
export const generateMockDeliveries = (qty = 10, pedidoIds = [], repartidorIds = []) => {
  const deliveries = [];
  for (let i = 0; i < qty; i++) {
    const pedidoId = pedidoIds.length > 0 ? faker.helpers.arrayElement(pedidoIds) : null;
    const repartidorId = repartidorIds.length > 0 ? faker.helpers.arrayElement(repartidorIds) : null;
    deliveries.push(generateMockDelivery(pedidoId, repartidorId));
  }
  return deliveries;
};
