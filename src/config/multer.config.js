import fs from 'node:fs';
import path from 'node:path';
import multer from 'multer';
import {
  ALLOWED_FILE_MIMETYPES,
  ALLOWED_FILE_EXTENSIONS,
  MAX_FILE_SIZE_BYTES,
  UPLOAD_SUBFOLDERS,
  USER_DOCUMENT_TYPES,
} from '../constants/index.js';
import { logger } from './logger.config.js';
import {
  FileSizeExceededError,
  InvalidFileTypeError,
  InvalidFileFieldError,
  FileSaveError,
} from '../errors/index.js';

/**
 * Directorio raíz de archivos subidos al servidor.
 * Está ignorado en .gitignore para evitar subir archivos al repositorio.
 */
export const UPLOADS_ROOT_DIR = path.resolve(process.cwd(), 'uploads');

export const UPLOADS_DIRECTORIES = Object.freeze({
  ROOT: UPLOADS_ROOT_DIR,
  DOCUMENTS: path.join(UPLOADS_ROOT_DIR, UPLOAD_SUBFOLDERS.DOCUMENTS),
  LICENSES: path.join(UPLOADS_ROOT_DIR, UPLOAD_SUBFOLDERS.LICENSES),
  RECEIPTS: path.join(UPLOADS_ROOT_DIR, UPLOAD_SUBFOLDERS.RECEIPTS),
});

/**
 * Garantiza que toda la estructura de carpetas de uploads exista en el servidor.
 */
export const ensureUploadDirectories = () => {
  for (const dirPath of Object.values(UPLOADS_DIRECTORIES)) {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
  }
};

ensureUploadDirectories();

/**
 * Sanitiza el nombre base de un archivo eliminando caracteres especiales o rutas inseguras.
 */
export const sanitizeFileBaseName = (originalName = 'archivo') => {
  const parsed = path.parse(path.basename(String(originalName)));
  const cleanBase = parsed.name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9_-]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '')
    .slice(0, 50);

  return cleanBase || 'archivo';
};

/**
 * Determina la subcarpeta de destino según la categoría o el tipo de documento enviado.
 * - licencias ('licencia') -> uploads/licenses
 * - documentos de usuario -> uploads/documents
 * - comprobantes de pedidos/entregas -> uploads/receipts
 */
export const resolveUploadSubfolder = (category = UPLOAD_SUBFOLDERS.DOCUMENTS, req = {}) => {
  const rawDocType = String(
    req.body?.documentType ||
      req.body?.tipoDocumento ||
      req.query?.documentType ||
      req.query?.tipoDocumento ||
      ''
  )
    .trim()
    .toLowerCase();

  if (category === UPLOAD_SUBFOLDERS.RECEIPTS) {
    return UPLOAD_SUBFOLDERS.RECEIPTS;
  }

  if (
    category === UPLOAD_SUBFOLDERS.LICENSES ||
    rawDocType === USER_DOCUMENT_TYPES.LICENCIA
  ) {
    return UPLOAD_SUBFOLDERS.LICENSES;
  }

  return UPLOAD_SUBFOLDERS.DOCUMENTS;
};

/**
 * Crea el motor diskStorage de Multer para una categoría de subida.
 */
const createDiskStorage = (defaultCategory) =>
  multer.diskStorage({
    destination: (req, file, cb) => {
      try {
        ensureUploadDirectories();
        const subfolder = resolveUploadSubfolder(defaultCategory, req);
        const targetDir = path.join(UPLOADS_ROOT_DIR, subfolder);

        if (!fs.existsSync(targetDir)) {
          fs.mkdirSync(targetDir, { recursive: true });
        }

        req.uploadSubfolder = subfolder;
        cb(null, targetDir);
      } catch (error) {
        logger.error(`Error al preparar carpeta de destino para upload: ${error.message}`);
        cb(new FileSaveError('No se pudo preparar el directorio de almacenamiento en el servidor'));
      }
    },
    filename: (req, file, cb) => {
      try {
        const ext = path.extname(file.originalname || '').toLowerCase();
        const safeBase = sanitizeFileBaseName(file.originalname);
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e6)}`;
        const generatedName = `${uniqueSuffix}-${safeBase}${ext}`;
        cb(null, generatedName);
      } catch (error) {
        logger.error(`Error al generar nombre de archivo en Multer: ${error.message}`);
        cb(new FileSaveError('Error al generar el nombre único del archivo'));
      }
    },
  });

/**
 * Valida que el nombre de campo (fieldname), el MIME type y la extensión del archivo sean permitidos.
 */
const createFileFilter = (allowedFields = ['file']) => (req, file, cb) => {
  if (!allowedFields.includes(file.fieldname)) {
    logger.warning(
      `Intento de subida con campo de archivo inválido: '${file.fieldname}'. Campos esperados: ${allowedFields.join(', ')}`
    );
    return cb(new InvalidFileFieldError(file.fieldname, allowedFields), false);
  }

  const mimeType = String(file.mimetype || '').toLowerCase();
  const ext = path.extname(file.originalname || '').toLowerCase();

  const isMimeAllowed = ALLOWED_FILE_MIMETYPES.includes(mimeType);
  const isExtAllowed = ALLOWED_FILE_EXTENSIONS.includes(ext);

  if (!isMimeAllowed || !isExtAllowed) {
    logger.warning(
      `Intento de subir archivo con tipo no permitido: nombre='${file.originalname}', mime='${mimeType}', ext='${ext}'`
    );
    return cb(
      new InvalidFileTypeError(
        mimeType || ext || 'desconocido',
        ALLOWED_FILE_MIMETYPES,
        `Tipo de archivo no permitido ('${file.originalname}'). Tipos aceptados: PDF, JPG, JPEG, PNG, WEBP`,
        {
          originalName: file.originalname,
          receivedMimeType: mimeType,
          receivedExtension: ext,
          allowedMimeTypes: ALLOWED_FILE_MIMETYPES,
          allowedExtensions: ALLOWED_FILE_EXTENSIONS,
        }
      ),
      false
    );
  }

  return cb(null, true);
};

/**
 * Convierte errores propios de Multer o del proceso de carga en errores del dominio (AppError)
 * y registra el evento en el logger centralizado.
 */
export const mapMulterUploadError = (err, allowedFields = ['file']) => {
  if (!err) return null;

  if (err.name === 'MulterError') {
    if (err.code === 'LIMIT_FILE_SIZE') {
      logger.warning(
        `Error al subir archivo: tamaño máximo superado (${MAX_FILE_SIZE_BYTES} bytes) en campo '${err.field || 'file'}'`
      );
      return new FileSizeExceededError(MAX_FILE_SIZE_BYTES, null, {
        field: err.field || allowedFields[0],
        maxSizeBytes: MAX_FILE_SIZE_BYTES,
      });
    }

    if (err.code === 'LIMIT_UNEXPECTED_FILE' || err.code === 'LIMIT_FILE_COUNT') {
      logger.warning(
        `Error al subir archivo: campo inesperado '${err.field}' (esperado: ${allowedFields.join(', ')})`
      );
      return new InvalidFileFieldError(err.field, allowedFields);
    }

    logger.error(`Error de Multer al subir archivo (${err.code}): ${err.message}`);
    return new FileSaveError(`Error durante la carga del archivo: ${err.message}`, {
      multerCode: err.code,
      field: err.field || null,
    });
  }

  return err;
};

/**
 * Fábrica que construye un middleware de subida para una categoría e intercepta errores de Multer
 * para derivarlos de forma limpia al middleware centralizado de errores.
 */
export const createUploadMiddleware = ({
  category = UPLOAD_SUBFOLDERS.DOCUMENTS,
  allowedFields = ['file'],
  maxFileSize = MAX_FILE_SIZE_BYTES,
} = {}) => {
  const uploader = multer({
    storage: createDiskStorage(category),
    fileFilter: createFileFilter(allowedFields),
    limits: {
      fileSize: maxFileSize,
      files: 1,
    },
  }).any();

  return (req, res, next) => {
    uploader(req, res, (err) => {
      if (err) {
        return next(mapMulterUploadError(err, allowedFields));
      }

      if (Array.isArray(req.files) && req.files.length > 0) {
        [req.file] = req.files;
      }

      return next();
    });
  };
};

/**
 * Elimina de forma segura un archivo físico en caso de que falle una validación posterior
 * (ej. usuario/pedido inexistente o tipo de documento inválido), evitando archivos huérfanos.
 */
export const removeUploadedFileSafely = (file) => {
  const filePath = typeof file === 'string' ? file : file?.path;
  if (!filePath) return;

  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (err) {
    logger.warning(`No se pudo eliminar el archivo temporal '${filePath}': ${err.message}`);
  }
};

/**
 * Middlewares listos para usar en las rutas de documentos de usuario y comprobantes de operaciones.
 */
export const uploadUserDocumentMiddleware = createUploadMiddleware({
  category: UPLOAD_SUBFOLDERS.DOCUMENTS,
  allowedFields: ['file', 'document', 'documento'],
  maxFileSize: MAX_FILE_SIZE_BYTES,
});

export const uploadReceiptMiddleware = createUploadMiddleware({
  category: UPLOAD_SUBFOLDERS.RECEIPTS,
  allowedFields: ['file', 'receipt', 'comprobante'],
  maxFileSize: MAX_FILE_SIZE_BYTES,
});

export default {
  UPLOADS_ROOT_DIR,
  UPLOADS_DIRECTORIES,
  ensureUploadDirectories,
  uploadUserDocumentMiddleware,
  uploadReceiptMiddleware,
  removeUploadedFileSafely,
};
