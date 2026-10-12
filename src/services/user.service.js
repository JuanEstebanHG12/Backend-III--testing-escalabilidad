import { UserRepository } from '../repositories/user.repository.js';
import { USER_ROLES } from '../constants/index.js';

/**
 * Capa Service de Usuarios:
 * Contiene la lógica de negocio para usuarios (validación de duplicados, asignación de roles mediante constantes).
 * Nunca importa Mongoose; toda persistencia pasa por UserRepository.
 */
export class UserService {
  constructor() {
    this.userRepository = new UserRepository();
  }

  /**
   * Obtiene la lista completa de usuarios.
   */
  async getAllUsers() {
    return await this.userRepository.getAll();
  }

  /**
   * Obtiene un usuario por ID.
   */
  async getUserById(id) {
    const user = await this.userRepository.getById(id);
    if (!user) {
      const error = new Error(`No se encontró el usuario con ID: ${id}`);
      error.statusCode = 404;
      throw error;
    }
    return user;
  }

  /**
   * Registra un nuevo usuario validando unicidad de correo y asignando roles seguros.
   */
  async createUser(userData) {
    const { name, email, password, role } = userData;

    if (!name || !email || !password) {
      const error = new Error('Los campos nombre, correo y contraseña son obligatorios');
      error.statusCode = 400;
      throw error;
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Regla de negocio: no permitir emails duplicados
    const existingUser = await this.userRepository.getByEmail(normalizedEmail);
    if (existingUser) {
      const error = new Error(`El correo ${normalizedEmail} ya se encuentra registrado`);
      error.statusCode = 400;
      throw error;
    }

    // Regla de negocio: validar el rol usando constantes
    let assignedRole = USER_ROLES.USER;
    if (role) {
      const validRoles = Object.values(USER_ROLES);
      if (!validRoles.includes(role)) {
        const error = new Error(`Rol inválido: ${role}. Roles permitidos: ${validRoles.join(', ')}`);
        error.statusCode = 400;
        throw error;
      }
      assignedRole = role;
    }

    const newUser = {
      name: name.trim(),
      email: normalizedEmail,
      password: password, // En módulos posteriores se agregará bcrypt/hashing
      role: assignedRole,
    };

    return await this.userRepository.create(newUser);
  }

  /**
   * Actualiza los datos de un usuario.
   */
  async updateUser(id, updateData) {
    await this.getUserById(id);

    const dataToUpdate = { ...updateData };

    if (dataToUpdate.email) {
      dataToUpdate.email = dataToUpdate.email.trim().toLowerCase();
      const existingUser = await this.userRepository.getByEmail(dataToUpdate.email);
      if (existingUser && existingUser._id.toString() !== id) {
        const error = new Error('El correo electrónico ya está en uso por otro usuario');
        error.statusCode = 400;
        throw error;
      }
    }

    if (dataToUpdate.role) {
      const validRoles = Object.values(USER_ROLES);
      if (!validRoles.includes(dataToUpdate.role)) {
        const error = new Error(`Rol inválido: ${dataToUpdate.role}. Roles permitidos: ${validRoles.join(', ')}`);
        error.statusCode = 400;
        throw error;
      }
    }

    return await this.userRepository.update(id, dataToUpdate);
  }

  /**
   * Elimina un usuario por su ID.
   */
  async deleteUser(id) {
    await this.getUserById(id);
    return await this.userRepository.delete(id);
  }
}
