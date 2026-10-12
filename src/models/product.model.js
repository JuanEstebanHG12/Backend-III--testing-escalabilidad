import mongoose from 'mongoose';
import { PRODUCT_STATUS } from '../constants/index.js';

const productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'El título del producto es obligatorio'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'La descripción del producto es obligatoria'],
      trim: true,
    },
    price: {
      type: Number,
      required: [true, 'El precio es obligatorio'],
      min: [0, 'El precio no puede ser negativo'],
    },
    stock: {
      type: Number,
      required: [true, 'El stock es obligatorio'],
      min: [0, 'El stock no puede ser negativo'],
      default: 0,
    },
    status: {
      type: String,
      enum: {
        values: Object.values(PRODUCT_STATUS),
        message: 'Estado de producto no válido: {VALUE}',
      },
      default: PRODUCT_STATUS.AVAILABLE,
    },
    category: {
      type: String,
      required: [true, 'La categoría es obligatoria'],
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

export const ProductModel = mongoose.model('Product', productSchema);
