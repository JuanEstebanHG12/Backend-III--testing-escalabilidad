import mongoose from 'mongoose';
import { USER_ROLES } from '../constants/index.js';

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
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

export const UserModel = mongoose.model('User', userSchema);
