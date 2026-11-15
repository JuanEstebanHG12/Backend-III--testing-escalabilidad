import { ProductRepository } from '../repositories/product.repository.js';
import { PRODUCT_STATUS } from '../constants/index.js';
import { isValidObjectId } from '../utils/validators.util.js';
import {
  ProductNotFoundError,
  InvalidStateError,
  NegativeValueError,
  ValidationError,
  InvalidIdError,
  ERROR_DICTIONARY,
} from '../errors/index.js';

/**
 * Capa Service de Productos:
 * Contiene toda la lógica de negocio y validaciones de dominio para inventario.
 * Se comunica únicamente con el Repository, nunca con Mongoose directamente.
 */
export class ProductService {
  constructor() {
    this.productRepository = new ProductRepository();
  }

  /**
   * Obtiene la lista de productos aplicando lógica de negocio.
   * Valida filtros de estado si se proporcionan.
   */
  async getAllProducts(queryParams = {}) {
    const filters = {};

    if (queryParams.category) {
      filters.category = String(queryParams.category).trim();
    }

    if (queryParams.status) {
      const validStates = Object.values(PRODUCT_STATUS);
      if (!validStates.includes(queryParams.status)) {
        throw new InvalidStateError(queryParams.status, validStates, 'producto');
      }
      filters.status = queryParams.status;
    }

    // Regla de negocio: si el cliente pide solo disponibles o solo en stock
    if (queryParams.onlyInStock === 'true') {
      filters.stock = { $gt: 0 };
      filters.status = PRODUCT_STATUS.AVAILABLE;
    }

    return await this.productRepository.getAll(filters);
  }

  /**
   * Obtiene un producto por su identificador.
   * Valida formato de ID y existencia, lanzando errores personalizados de dominio.
   */
  async getProductById(id) {
    if (!isValidObjectId(id)) {
      throw new InvalidIdError(id, 'producto');
    }

    const product = await this.productRepository.getById(id);
    if (!product) {
      throw new ProductNotFoundError(id);
    }
    return product;
  }

  /**
   * Crea un nuevo producto aplicando reglas de inventario y validaciones de negocio.
   */
  async createProduct(productData = {}) {
    if (!productData || typeof productData !== 'object') {
      throw new ValidationError(
        ERROR_DICTIONARY.MISSING_REQUIRED_FIELDS.message,
        { required: ['title', 'description', 'price', 'stock', 'category'] },
        ERROR_DICTIONARY.MISSING_REQUIRED_FIELDS.code
      );
    }

    const { title, description, price, stock, category, status: explicitStatus } = productData;

    if (
      !title ||
      !description ||
      price === undefined ||
      price === null ||
      price === '' ||
      stock === undefined ||
      stock === null ||
      stock === '' ||
      !category
    ) {
      throw new ValidationError(
        'Todos los campos son obligatorios (title, description, price, stock, category)',
        { required: ['title', 'description', 'price', 'stock', 'category'] },
        ERROR_DICTIONARY.MISSING_REQUIRED_FIELDS.code
      );
    }

    const numericPrice = Number(price);
    const numericStock = Number(stock);

    if (Number.isNaN(numericPrice) || !Number.isFinite(numericPrice)) {
      throw new ValidationError('El precio del producto debe ser un número válido', {
        field: 'price',
        value: price,
      });
    }

    if (Number.isNaN(numericStock) || !Number.isFinite(numericStock) || !Number.isInteger(numericStock)) {
      throw new ValidationError('El stock del producto debe ser un número entero válido', {
        field: 'stock',
        value: stock,
      });
    }

    if (numericPrice < 0) {
      throw new NegativeValueError('price', numericPrice, 'El precio del producto no puede ser menor a 0');
    }

    if (numericStock < 0) {
      throw new NegativeValueError('stock', numericStock, 'El stock no puede ser negativo');
    }

    if (explicitStatus !== undefined) {
      const validStates = Object.values(PRODUCT_STATUS);
      if (!validStates.includes(explicitStatus)) {
        throw new InvalidStateError(explicitStatus, validStates, 'producto');
      }
    }

    // Regla de negocio: determinación automática del estado según el stock usando constantes
    const status = numericStock > 0 ? PRODUCT_STATUS.AVAILABLE : PRODUCT_STATUS.OUT_OF_STOCK;

    const newProduct = {
      title: String(title).trim(),
      description: String(description).trim(),
      price: numericPrice,
      stock: numericStock,
      category: String(category).trim(),
      status,
    };

    return await this.productRepository.create(newProduct);
  }

  /**
   * Actualiza un producto existente.
   * Recalcula el estado en base al nuevo stock si este fue modificado.
   */
  async updateProduct(id, updateData = {}) {
    await this.getProductById(id);

    if (!updateData || typeof updateData !== 'object' || Object.keys(updateData).length === 0) {
      throw new ValidationError('Debe proporcionar al menos un campo para actualizar el producto');
    }

    const dataToUpdate = { ...updateData };

    if (dataToUpdate.price !== undefined) {
      const numericPrice = Number(dataToUpdate.price);
      if (Number.isNaN(numericPrice) || !Number.isFinite(numericPrice)) {
        throw new ValidationError('El precio debe ser un número válido', {
          field: 'price',
          value: dataToUpdate.price,
        });
      }
      if (numericPrice < 0) {
        throw new NegativeValueError('price', numericPrice, 'El precio no puede ser negativo');
      }
      dataToUpdate.price = numericPrice;
    }

    if (dataToUpdate.status !== undefined) {
      const validStates = Object.values(PRODUCT_STATUS);
      if (!validStates.includes(dataToUpdate.status)) {
        throw new InvalidStateError(dataToUpdate.status, validStates, 'producto');
      }
    }

    if (dataToUpdate.stock !== undefined) {
      const numericStock = Number(dataToUpdate.stock);
      if (Number.isNaN(numericStock) || !Number.isFinite(numericStock) || !Number.isInteger(numericStock)) {
        throw new ValidationError('El stock debe ser un número entero válido', {
          field: 'stock',
          value: dataToUpdate.stock,
        });
      }
      if (numericStock < 0) {
        throw new NegativeValueError('stock', numericStock, 'El stock no puede ser negativo');
      }
      dataToUpdate.stock = numericStock;
      // Regla de negocio: sincronizamos el estado con el stock
      dataToUpdate.status = numericStock > 0 ? PRODUCT_STATUS.AVAILABLE : PRODUCT_STATUS.OUT_OF_STOCK;
    }

    return await this.productRepository.update(id, dataToUpdate);
  }

  /**
   * Elimina un producto por ID tras validar su existencia.
   */
  async deleteProduct(id) {
    await this.getProductById(id);
    return await this.productRepository.delete(id);
  }
}
