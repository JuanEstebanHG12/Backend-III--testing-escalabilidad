import mongoose from 'mongoose';
import { USER_ROLES, USER_DOCUMENT_TYPES } from '../constants/index.js';

const userDocumentMetadataSchema = new mongoose.Schema(
  {
    originalName: {
      type: String,
      required: [true, 'El nombre original del archivo es obligatorio'],
      trim: true,
    },
    generatedName: {
      type: String,
      required: [true, 'El nombre generado del archivo es obligatorio'],
      trim: true,
    },
    path: {
      type: String,
      required: [true, 'La ruta del archivo es obligatoria'],
      trim: true,
    },
    mimeType: {
      type: String,
      required: [true, 'El tipo MIME del archivo es obligatorio'],
      trim: true,
    },
    size: {
      type: Number,
      required: [true, 'El tamaño del archivo es obligatorio'],
      min: [0, 'El tamaño del archivo no puede ser negativo'],
    },
    documentType: {
      type: String,
      enum: {
        values: Object.values(USER_DOCUMENT_TYPES),
        message: 'Tipo de documento no válido: {VALUE}',
      },
      required: [true, 'El tipo de documento es obligatorio'],
    },
    uploadedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      alias: 'name',
      required: [true, 'El nombre es obligatorio'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'El correo electrónico es obligatorio'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'La contraseña es obligatoria'],
      default: 'password123',
    },
    rol: {
      type: String,
      alias: 'role',
      enum: {
        values: Object.values(USER_ROLES),
        message: 'Rol no válido: {VALUE}',
      },
      default: USER_ROLES.CLIENTE,
    },
    documents: {
      type: [userDocumentMetadataSchema],
      default: [],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

export const UserModel = mongoose.model('User', userSchema);
