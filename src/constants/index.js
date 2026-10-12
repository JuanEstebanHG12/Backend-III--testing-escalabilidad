/**
 * Constantes inmutables para el sistema de ShipNow.
 * Object.freeze previene modificaciones accidentales en tiempo de ejecución.
 */

// Roles de usuario (clientes, repartidores y administradores)
export const USER_ROLES = Object.freeze({
  CLIENTE: 'cliente',
  REPARTIDOR: 'repartidor',
  ADMIN: 'admin',
  // Compatibilidad con el módulo anterior
  USER: 'cliente',
});

// Estados posibles para un pedido
export const ORDER_STATUS = Object.freeze({
  PENDIENTE: 'pendiente',
  EN_PREPARACION: 'en_preparacion',
  ENVIADO: 'enviado',
  ENTREGADO: 'entregado',
  CANCELADO: 'cancelado',
});

// Niveles de prioridad para un pedido
export const ORDER_PRIORITY = Object.freeze({
  BAJA: 'baja',
  MEDIA: 'media',
  ALTA: 'alta',
  URGENTE: 'urgente',
});

// Estados de una entrega logística
export const DELIVERY_STATUS = Object.freeze({
  ASIGNADA: 'asignada',
  EN_CAMINO: 'en_camino',
  ENTREGADA: 'entregada',
  FALLIDA: 'fallida',
});

// Estados del inventario de productos (módulo 1)
export const PRODUCT_STATUS = Object.freeze({
  AVAILABLE: 'AVAILABLE',
  OUT_OF_STOCK: 'OUT_OF_STOCK',
});
