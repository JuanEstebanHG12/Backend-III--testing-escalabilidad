import { UserModel } from '../models/user.model.js';

/**
 * Capa Repository de Usuarios:
 * Única encargada de interactuar con el modelo de usuarios en MongoDB.
 * Encapsula la protección de campos sensibles (excluye 'password' y '__v' por defecto).
 */
export class UserRepository {
  /**
   * Obtiene todos los usuarios, excluyendo la contraseña y __v.
   */
  async getAll() {
    return await UserModel.find().select('-password -__v').sort({ createdAt: -1 }).lean();
  }

  /**
   * Obtiene un usuario por su ID, protegiendo la contraseña.
   */
  async getById(id) {
    return await UserModel.findById(id).select('-password -__v').lean();
  }

  /**
   * Busca usuarios por rol específico (ej. 'repartidor' o 'cliente').
   */
  async getByRole(rol) {
    return await UserModel.find({ rol }).select('-password -__v').lean();
  }

  /**
   * Busca un usuario por correo electrónico.
   * Por defecto no incluye la contraseña, pero permite incluirla si fuera necesario para autenticación.
   */
  async getByEmail(email, includePassword = false) {
    const query = UserModel.findOne({ email });
    if (!includePassword) {
      query.select('-password -__v');
    }
    return await query.lean();
  }

  /**
   * Registra un nuevo usuario y devuelve el documento sin el campo password.
   */
  async create(userData) {
    const user = await UserModel.create(userData);
    const userObject = user.toObject();
    delete userObject.password;
    delete userObject.__v;
    return userObject;
  }

  /**
   * Inserta múltiples usuarios por lote (para seeding controlado).
   */
  async createMany(usersArray) {
    const inserted = await UserModel.insertMany(usersArray);
    return inserted.map((user) => {
      const userObject = user.toObject();
      delete userObject.password;
      delete userObject.__v;
      return userObject;
    });
  }

  /**
   * Actualiza los datos de un usuario por su ID.
   */
  async update(id, updateData) {
    return await UserModel.findByIdAndUpdate(id, updateData, {
      returnDocument: 'after',
      runValidators: true,
    })
      .select('-password -__v')
      .lean();
  }

  /**
   * Elimina un usuario por su ID.
   */
  async delete(id) {
    return await UserModel.findByIdAndDelete(id).select('-password -__v').lean();
  }

  /**
   * Limpia todos los usuarios (útil para pruebas y reseteo).
   */
  async deleteAll() {
    return await UserModel.deleteMany({});
  }
}
