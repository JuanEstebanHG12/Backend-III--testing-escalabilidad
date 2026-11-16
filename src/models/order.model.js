import mongoose from 'mongoose';
import { ORDER_STATUS, ORDER_PRIORITY, RECEIPT_TYPES } from '../constants/index.js';

const orderReceiptMetadataSchema = new mongoose.Schema(
  {
    originalName: {
      type: String,
      required: [true, 'El nombre original del comprobante es obligatorio'],
      trim: true,
    },
    generatedName: {
      type: String,
      required: [true, 'El nombre generado del comprobante es obligatorio'],
      trim: true,
    },
    path: {
      type: String,
      required: [true, 'La ruta del comprobante es obligatoria'],
      trim: true,
    },
    mimeType: {
      type: String,
      required: [true, 'El tipo MIME del comprobante es obligatorio'],
      trim: true,
    },
    size: {
      type: Number,
      required: [true, 'El tamaño del comprobante es obligatorio'],
      min: [0, 'El tamaño del comprobante no puede ser negativo'],
    },
    documentType: {
      type: String,
      enum: {
        values: Object.values(RECEIPT_TYPES),
        message: 'Tipo de comprobante no válido: {VALUE}',
      },
      default: RECEIPT_TYPES.COMPROBANTE_PAGO,
    },
    uploadedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const orderItemSchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: [true, 'El nombre del ítem es obligatorio'],
      trim: true,
    },
    cantidad: {
      type: Number,
      required: [true, 'La cantidad del ítem es obligatoria'],
      min: [1, 'La cantidad mínima por ítem es 1'],
      default: 1,
    },
    precioUnitario: {
      type: Number,
      required: [true, 'El precio unitario del ítem es obligatorio'],
      min: [0, 'El precio unitario no puede ser negativo'],
      default: 0,
    },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    codigo: {
      type: String,
      required: [true, 'El código del pedido es obligatorio'],
      unique: true,
      trim: true,
    },
    cliente: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'El usuario o cliente es obligatorio para el pedido'],
    },
    descripcion: {
      type: String,
      required: [true, 'La descripción del pedido es obligatoria'],
      trim: true,
    },
    items: {
      type: [orderItemSchema],
      default: [],
    },
    total: {
      type: Number,
      required: [true, 'El total del pedido es obligatorio'],
      min: [0, 'El total no puede ser negativo'],
    },
    direccionEntrega: {
      type: String,
      required: [true, 'La dirección de entrega es obligatoria'],
      trim: true,
    },
    estado: {
      type: String,
      enum: {
        values: Object.values(ORDER_STATUS),
        message: 'Estado de pedido no válido: {VALUE}',
      },
      default: ORDER_STATUS.PENDIENTE,
    },
    prioridad: {
      type: String,
      enum: {
        values: Object.values(ORDER_PRIORITY),
        message: 'Prioridad no válida: {VALUE}',
      },
      default: ORDER_PRIORITY.MEDIA,
    },
    comprobantes: {
      type: [orderReceiptMetadataSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

export const OrderModel = mongoose.model('Order', orderSchema);
