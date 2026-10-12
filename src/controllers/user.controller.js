import { UserService } from '../services/user.service.js';

/**
 * Capa Controller de Usuarios:
 * Única puerta de entrada HTTP para la entidad Usuarios.
 * Gestiona req y res, códigos de respuesta HTTP y delega la lógica al UserService.
 * NUNCA importa Mongoose.
 */
export class UserController {
  constructor() {
    this.userService = new UserService();
  }

  /**
   * GET /api/users
   */
  getAll = async (req, res, next) => {
    try {
      const users = await this.userService.getAllUsers();
      return res.status(200).json({
        success: true,
        data: users,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/users/:id
   */
  getById = async (req, res, next) => {
    try {
      const { id } = req.params;
      const user = await this.userService.getUserById(id);
      return res.status(200).json({
        success: true,
        data: user,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /api/users
   */
  create = async (req, res, next) => {
    try {
      const newUser = await this.userService.createUser(req.body);
      return res.status(201).json({
        success: true,
        message: 'Usuario creado exitosamente',
        data: newUser,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * PUT /api/users/:id
   */
  update = async (req, res, next) => {
    try {
      const { id } = req.params;
      const updatedUser = await this.userService.updateUser(id, req.body);
      return res.status(200).json({
        success: true,
        message: 'Usuario actualizado exitosamente',
        data: updatedUser,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * DELETE /api/users/:id
   */
  delete = async (req, res, next) => {
    try {
      const { id } = req.params;
      await this.userService.deleteUser(id);
      return res.status(200).json({
        success: true,
        message: 'Usuario eliminado exitosamente',
      });
    } catch (error) {
      next(error);
    }
  };
}
