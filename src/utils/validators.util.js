/**
 * Utilidades de validación puras para la capa de Servicios.
 * No dependen de Mongoose para mantener el desacoplamiento de capas.
 */

const OBJECT_ID_REGEX = /^[0-9a-fA-F]{24}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Verifica si un string corresponde al formato hexadecimal de 24 caracteres de un ObjectId de MongoDB.
 */
export const isValidObjectId = (id) => {
  return typeof id === 'string' && OBJECT_ID_REGEX.test(id.trim());
};

/**
 * Verifica si un correo electrónico tiene un formato válido.
 */
export const isValidEmail = (email) => {
  return typeof email === 'string' && EMAIL_REGEX.test(email.trim());
};
