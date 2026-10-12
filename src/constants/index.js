/**
 * Constantes inmutables para los roles de usuarios en el sistema.
 * El uso de Object.freeze asegura que nadie pueda modificar los valores en tiempo de ejecución.
 */
export const USER_ROLES = Object.freeze({
  ADMIN: 'ADMIN',
  USER: 'USER',
});

/**
 * Constantes inmutables para el estado de inventario de los productos.
 */
export const PRODUCT_STATUS = Object.freeze({
  AVAILABLE: 'AVAILABLE',
  OUT_OF_STOCK: 'OUT_OF_STOCK',
});
