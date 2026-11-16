import mongoose from 'mongoose';
import { DELIVERY_STATUS, RECEIPT_TYPES } from '../constants/index.js';

const deliveryReceiptMetadataSchema = new mongoose.Schema(
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
      default: RECEIPT_TYPES.COMPROBANTE_ENTREGA,
    },
    uploadedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

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
    comprobantes: {
      type: [deliveryReceiptMetadataSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

export const DeliveryModel = mongoose.model('Delivery', deliverySchema);
