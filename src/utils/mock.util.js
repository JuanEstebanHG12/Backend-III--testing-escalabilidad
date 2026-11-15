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
export const generateMockUser = (customRole = null, index = null) => {
  // Solo asignamos roles válidos de la constante
  const validRoles = [USER_ROLES.CLIENTE, USER_ROLES.REPARTIDOR];
  const rol = customRole || faker.helpers.arrayElement(validRoles);

  const firstName = faker.person.firstName();
  const lastName = faker.person.lastName();
  const nombre = `${firstName} ${lastName}`;
  const cleanFirst = firstName.toLowerCase().replace(/[^a-z]/g, '') || 'usuario';
  const cleanLast = lastName.toLowerCase().replace(/[^a-z]/g, '') || 'mock';
  const uniqueSuffix =
    index !== null
      ? `${index}_${faker.string.alphanumeric({ length: 4, casing: 'lower' })}`
      : `${faker.number.int({ min: 100, max: 99999 })}`;
  const email = `${cleanFirst}.${cleanLast}.${uniqueSuffix}@test.com`;

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
    users.push(generateMockUser(role, i + 1));
  }
  return users;
};

/**
 * Genera un pedido simulado asociado a un cliente.
 */
export const generateMockOrder = (clienteId = null, index = null) => {
  const idCliente = clienteId || faker.database.mongodbObjectId();
  const suffix = index !== null ? `${index}-${faker.string.alphanumeric({ length: 5, casing: 'upper' })}` : faker.string.alphanumeric({ length: 7, casing: 'upper' });

  return {
    codigo: `PED-${suffix}`,
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
    orders.push(generateMockOrder(clienteId, i + 1));
  }
  return orders;
};

/**
 * Genera una entrega simulada asociada a un pedido y a un repartidor.
 */
export const generateMockDelivery = (pedidoId = null, repartidorId = null, index = null) => {
  const idPedido = pedidoId || faker.database.mongodbObjectId();
  const idRepartidor = repartidorId || faker.database.mongodbObjectId();
  const suffix = index !== null ? `${index}-${faker.string.alphanumeric({ length: 5, casing: 'upper' })}` : faker.string.alphanumeric({ length: 7, casing: 'upper' });

  return {
    codigoSeguimiento: `ENT-${suffix}`,
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
    deliveries.push(generateMockDelivery(pedidoId, repartidorId, i + 1));
  }
  return deliveries;
};
