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
    const name = (userData.nombre || userData.name || '').trim();
    const email = (userData.email || '').trim().toLowerCase();
    const password = userData.password || 'password123';
    const roleInput = userData.rol || userData.role;

    if (!name || !email || !password) {
      const error = new Error('Los campos nombre, correo y contraseña son obligatorios');
      error.statusCode = 400;
      throw error;
    }

    // Regla de negocio: no permitir emails duplicados
    const existingUser = await this.userRepository.getByEmail(email);
    if (existingUser) {
      const error = new Error(`El correo ${email} ya se encuentra registrado`);
      error.statusCode = 400;
      throw error;
    }

    // Regla de negocio: validar el rol usando constantes
    let assignedRole = USER_ROLES.CLIENTE;
    if (roleInput) {
      const validRoles = Object.values(USER_ROLES);
      if (!validRoles.includes(roleInput)) {
        const error = new Error(`Rol inválido: ${roleInput}. Roles permitidos: ${validRoles.join(', ')}`);
        error.statusCode = 400;
        throw error;
      }
      assignedRole = roleInput;
    }

    const newUser = {
      nombre: name,
      email,
      password,
      rol: assignedRole,
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

    if (dataToUpdate.nombre) {
      dataToUpdate.nombre = dataToUpdate.nombre.trim();
    }

    if (dataToUpdate.name) {
      dataToUpdate.nombre = dataToUpdate.name.trim();
    }

    const roleToUpdate = dataToUpdate.rol || dataToUpdate.role;
    if (roleToUpdate) {
      const validRoles = Object.values(USER_ROLES);
      if (!validRoles.includes(roleToUpdate)) {
        const error = new Error(`Rol inválido: ${roleToUpdate}. Roles permitidos: ${validRoles.join(', ')}`);
        error.statusCode = 400;
        throw error;
      }
      dataToUpdate.rol = roleToUpdate;
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
