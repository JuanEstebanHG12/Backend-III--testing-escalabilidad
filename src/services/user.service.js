import fs from 'node:fs';
import path from 'node:path';
import { UserRepository } from '../repositories/user.repository.js';
import {
  USER_ROLES,
  USER_DOCUMENT_TYPES,
  UPLOAD_SUBFOLDERS,
} from '../constants/index.js';
import { logger } from '../config/logger.config.js';
import {
  UPLOADS_ROOT_DIR,
  removeUploadedFileSafely,
} from '../config/multer.config.js';
import { isValidObjectId, isValidEmail } from '../utils/validators.util.js';
import {
  UserNotFoundError,
  InvalidRoleError,
  DuplicateResourceError,
  ValidationError,
  InvalidIdError,
  FileRequiredError,
  InvalidDocumentTypeError,
  FileSaveError,
  ERROR_DICTIONARY,
} from '../errors/index.js';

/**
 * Capa Service de Usuarios:
 * Contiene la lógica de negocio para usuarios, registra eventos con Winston y lanza errores personalizados del dominio.
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
   * Obtiene un usuario por ID validando el formato del identificador y su existencia.
   */
  async getUserById(id) {
    if (!isValidObjectId(id)) {
      throw new InvalidIdError(id, 'usuario');
    }

    const user = await this.userRepository.getById(id);
    if (!user) {
      logger.warning(`Usuario no encontrado con ID: ${id}`);
      throw new UserNotFoundError(id);
    }
    return user;
  }

  /**
   * Registra un nuevo usuario validando campos obligatorios, formato de email,
   * unicidad de correo y asignación de roles válidos mediante constantes.
   */
  async createUser(userData = {}) {
    if (!userData || typeof userData !== 'object') {
      throw new ValidationError(
        ERROR_DICTIONARY.MISSING_REQUIRED_FIELDS.message,
        { required: ['nombre', 'email'] },
        ERROR_DICTIONARY.MISSING_REQUIRED_FIELDS.code
      );
    }

    const name = (userData.nombre || userData.name || '').trim();
    const email = (userData.email || '').trim().toLowerCase();
    const password =
      userData.password !== undefined ? String(userData.password).trim() : 'password123';
    const roleInput = userData.rol !== undefined ? userData.rol : userData.role;

    if (!name || !email || !password) {
      throw new ValidationError(
        'Los campos nombre, correo y contraseña son obligatorios',
        { required: ['nombre', 'email', 'password'] },
        ERROR_DICTIONARY.MISSING_REQUIRED_FIELDS.code
      );
    }

    if (!isValidEmail(email)) {
      throw new ValidationError(`El correo electrónico '${email}' no tiene un formato válido`, {
        field: 'email',
        value: email,
      });
    }

    let assignedRole = USER_ROLES.CLIENTE;
    if (roleInput !== undefined && roleInput !== null && roleInput !== '') {
      const validRoles = Object.values(USER_ROLES);
      if (!validRoles.includes(roleInput)) {
        throw new InvalidRoleError(roleInput, validRoles);
      }
      assignedRole = roleInput;
    }

    const existingUser = await this.userRepository.getByEmail(email);
    if (existingUser) {
      throw new DuplicateResourceError(
        `El correo ${email} ya se encuentra registrado`,
        { field: 'email', value: email },
        ERROR_DICTIONARY.USER_ALREADY_EXISTS.code
      );
    }

    const newUser = {
      nombre: name,
      email,
      password,
      rol: assignedRole,
    };

    const createdUser = await this.userRepository.create(newUser);
    logger.info(`Usuario registrado correctamente: ${createdUser.email} (rol: ${createdUser.rol})`);
    return createdUser;
  }

  /**
   * Actualiza los datos de un usuario existente.
   */
  async updateUser(id, updateData = {}) {
    await this.getUserById(id);

    if (!updateData || typeof updateData !== 'object' || Object.keys(updateData).length === 0) {
      throw new ValidationError('Debe proporcionar al menos un campo para actualizar el usuario');
    }

    const dataToUpdate = { ...updateData };

    if (dataToUpdate.email !== undefined) {
      dataToUpdate.email = String(dataToUpdate.email).trim().toLowerCase();
      if (!isValidEmail(dataToUpdate.email)) {
        throw new ValidationError(
          `El correo electrónico '${dataToUpdate.email}' no tiene un formato válido`,
          { field: 'email', value: dataToUpdate.email }
        );
      }

      const existingUser = await this.userRepository.getByEmail(dataToUpdate.email);
      if (existingUser && existingUser._id.toString() !== id) {
        throw new DuplicateResourceError(
          'El correo electrónico ya está en uso por otro usuario',
          { field: 'email', value: dataToUpdate.email },
          ERROR_DICTIONARY.USER_ALREADY_EXISTS.code
        );
      }
    }

    if (dataToUpdate.nombre !== undefined) {
      dataToUpdate.nombre = String(dataToUpdate.nombre).trim();
      if (!dataToUpdate.nombre) {
        throw new ValidationError('El nombre del usuario no puede estar vacío', { field: 'nombre' });
      }
    }

    if (dataToUpdate.name !== undefined) {
      dataToUpdate.nombre = String(dataToUpdate.name).trim();
      delete dataToUpdate.name;
      if (!dataToUpdate.nombre) {
        throw new ValidationError('El nombre del usuario no puede estar vacío', { field: 'nombre' });
      }
    }

    const roleToUpdate =
      dataToUpdate.rol !== undefined ? dataToUpdate.rol : dataToUpdate.role;
    if (roleToUpdate !== undefined) {
      const validRoles = Object.values(USER_ROLES);
      if (!validRoles.includes(roleToUpdate)) {
        throw new InvalidRoleError(roleToUpdate, validRoles);
      }
      dataToUpdate.rol = roleToUpdate;
      delete dataToUpdate.role;
    }

    const updatedUser = await this.userRepository.update(id, dataToUpdate);
    logger.info(`Usuario con ID ${id} actualizado correctamente`);
    return updatedUser;
  }

  /**
   * Elimina un usuario por su ID tras verificar su existencia.
   */
  async deleteUser(id) {
    await this.getUserById(id);
    const deleted = await this.userRepository.delete(id);
    logger.info(`Usuario con ID ${id} eliminado correctamente`);
    return deleted;
  }

  /**
   * Asocia un documento o licencia a un usuario existente:
   * - Verifica que el usuario exista (si no existe, limpia el archivo físico temporal y lanza UserNotFoundError).
   * - Valida que el archivo haya sido adjuntado.
   * - Valida que el tipo de documento sea válido según USER_DOCUMENT_TYPES.
   * - Si es de tipo 'licencia' y quedó en 'documents', lo reubica en 'uploads/licenses'.
   * - Registra únicamente los metadatos en la entidad usuario y deja trazabilidad en Winston.
   */
  async uploadUserDocument(userId, file, rawDocumentType) {
    try {
      if (!isValidObjectId(userId)) {
        removeUploadedFileSafely(file);
        throw new InvalidIdError(userId, 'usuario');
      }

      const existingUser = await this.userRepository.getById(userId);
      if (!existingUser) {
        removeUploadedFileSafely(file);
        logger.warning(
          `Intento de subir documento para usuario inexistente (ID: ${userId})`
        );
        throw new UserNotFoundError(userId);
      }

      if (!file) {
        logger.warning(
          `Error al subir documento para el usuario ${userId}: no se adjuntó ningún archivo`
        );
        throw new FileRequiredError('file');
      }

      const normalizedDocType = String(rawDocumentType || '')
        .trim()
        .toLowerCase();
      const allowedDocTypes = Object.values(USER_DOCUMENT_TYPES);

      if (!normalizedDocType || !allowedDocTypes.includes(normalizedDocType)) {
        removeUploadedFileSafely(file);
        logger.warning(
          `Intento de subir documento con tipo de documento inválido ('${rawDocumentType ?? ''}') para el usuario ${userId}`
        );
        throw new InvalidDocumentTypeError(rawDocumentType, allowedDocTypes);
      }

      // Aseguramos que las licencias queden en uploads/licenses y el resto en uploads/documents
      const targetSubfolder =
        normalizedDocType === USER_DOCUMENT_TYPES.LICENCIA
          ? UPLOAD_SUBFOLDERS.LICENSES
          : UPLOAD_SUBFOLDERS.DOCUMENTS;

      const targetDir = path.join(UPLOADS_ROOT_DIR, targetSubfolder);
      if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
      }

      let finalAbsolutePath = file.path;
      const expectedPath = path.join(targetDir, file.filename);
      if (file.path && path.resolve(file.path) !== path.resolve(expectedPath)) {
        fs.renameSync(file.path, expectedPath);
        finalAbsolutePath = expectedPath;
      }

      const relativeFilePath = path
        .relative(process.cwd(), finalAbsolutePath)
        .split(path.sep)
        .join('/');

      const documentMetadata = {
        originalName: file.originalname,
        generatedName: file.filename,
        path: relativeFilePath,
        mimeType: file.mimetype,
        size: file.size,
        documentType: normalizedDocType,
        uploadedAt: new Date(),
      };

      const updatedUser = await this.userRepository.addDocument(userId, documentMetadata);

      logger.info(
        `Carga exitosa de documento '${normalizedDocType}' ('${file.originalname}' -> '${file.filename}') asociado al usuario ${userId}`
      );

      return {
        user: updatedUser,
        document: documentMetadata,
      };
    } catch (error) {
      if (
        !(error instanceof UserNotFoundError) &&
        !(error instanceof InvalidIdError) &&
        !(error instanceof FileRequiredError) &&
        !(error instanceof InvalidDocumentTypeError)
      ) {
        removeUploadedFileSafely(file);
        logger.error(
          `Error al guardar documento para el usuario ${userId}: ${error.message}`
        );
        throw new FileSaveError(
          `Error al guardar el documento del usuario: ${error.message}`
        );
      }
      throw error;
    }
  }
}
