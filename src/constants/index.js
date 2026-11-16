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

// Tipos de documento de usuario permitidos (módulo 7)
export const USER_DOCUMENT_TYPES = Object.freeze({
  IDENTIFICACION: 'identificacion',
  LICENCIA: 'licencia',
  COMPROBANTE_DOMICILIO: 'comprobante_domicilio',
  CONTRATO: 'contrato',
});

// Tipos de comprobantes para pedidos y entregas (módulo 7)
export const RECEIPT_TYPES = Object.freeze({
  COMPROBANTE_PAGO: 'comprobante_pago',
  COMPROBANTE_ENTREGA: 'comprobante_entrega',
  FACTURA: 'factura',
  REMITO: 'remito',
});

// Todos los tipos de documentos y comprobantes permitidos en el sistema
export const DOCUMENT_TYPES = Object.freeze({
  ...USER_DOCUMENT_TYPES,
  ...RECEIPT_TYPES,
});

// Tipos MIME y extensiones aceptados para carga de archivos con Multer
export const ALLOWED_FILE_MIMETYPES = Object.freeze([
  'application/pdf',
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
]);

export const ALLOWED_FILE_EXTENSIONS = Object.freeze([
  '.pdf',
  '.jpg',
  '.jpeg',
  '.png',
  '.webp',
]);

// Tamaño máximo de archivo por defecto (5 MB)
export const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;

// Subcarpetas organizadas por categoría de archivo
export const UPLOAD_SUBFOLDERS = Object.freeze({
  DOCUMENTS: 'documents',
  LICENSES: 'licenses',
  RECEIPTS: 'receipts',
});

export { ERROR_DICTIONARY } from '../errors/error.dictionary.js';
