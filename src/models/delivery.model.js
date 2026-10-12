import mongoose from 'mongoose';
import { DELIVERY_STATUS } from '../constants/index.js';

const deliverySchema = new mongoose.Schema(
  {
    codigoSeguimiento: {
      type: String,
      required: [true, 'El código de seguimiento es obligatorio'],
      unique: true,
      trim: true,
    },
    pedido: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: [true, 'El pedido asociado es obligatorio'],
    },
    repartidor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'El repartidor asignado es obligatorio'],
    },
    estado: {
      type: String,
      enum: {
        values: Object.values(DELIVERY_STATUS),
        message: 'Estado de entrega no válido: {VALUE}',
      },
      default: DELIVERY_STATUS.ASIGNADA,
    },
    fechaEstimada: {
      type: Date,
      required: [true, 'La fecha estimada de entrega es obligatoria'],
    },
    direccion: {
      type: String,
      required: [true, 'La dirección de entrega es obligatoria'],
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

export const DeliveryModel = mongoose.model('Delivery', deliverySchema);
