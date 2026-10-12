import mongoose from 'mongoose';
import { ORDER_STATUS, ORDER_PRIORITY } from '../constants/index.js';

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
  },
  {
    timestamps: true,
  }
);

export const OrderModel = mongoose.model('Order', orderSchema);
