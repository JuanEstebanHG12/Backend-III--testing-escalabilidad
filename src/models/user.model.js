import mongoose from 'mongoose';
import { USER_ROLES } from '../constants/index.js';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
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
    },
    role: {
      type: String,
      enum: {
        values: Object.values(USER_ROLES),
        message: 'Rol no válido: {VALUE}',
      },
      default: USER_ROLES.USER,
    },
  },
  {
    timestamps: true,
  }
);

export const UserModel = mongoose.model('User', userSchema);
