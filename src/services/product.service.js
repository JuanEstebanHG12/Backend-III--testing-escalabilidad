import { ProductRepository } from '../repositories/product.repository.js';
import { PRODUCT_STATUS } from '../constants/index.js';

/**
 * Capa Service de Productos:
 * Contiene toda la lógica de negocio.
 * Se comunica únicamente con el Repository, nunca con Mongoose directamente.
 */
export class ProductService {
  constructor() {
    this.productRepository = new ProductRepository();
  }

  /**
   * Obtiene la lista de productos aplicando lógica de negocio.
   * Si se solicita `onlyInStock=true`, filtra los productos que tengan stock > 0.
   */
  async getAllProducts(queryParams = {}) {
    const filters = {};

    // Si viene filtro por categoría
    if (queryParams.category) {
      filters.category = queryParams.category;
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
   * Valida existencia y lanza error de negocio si no existe.
   */
  async getProductById(id) {
    const product = await this.productRepository.getById(id);
    if (!product) {
      const error = new Error(`No se encontró el producto con ID: ${id}`);
      error.statusCode = 404;
      throw error;
    }
    return product;
  }

  /**
   * Crea un nuevo producto aplicando reglas de inventario.
   */
  async createProduct(productData) {
    const { title, description, price, stock, category } = productData;

    // Validaciones de negocio
    if (!title || !description || price === undefined || stock === undefined || !category) {
      const error = new Error('Todos los campos son obligatorios (title, description, price, stock, category)');
      error.statusCode = 400;
      throw error;
    }

    if (Number(price) < 0) {
      const error = new Error('El precio del producto no puede ser menor a 0');
      error.statusCode = 400;
      throw error;
    }

    if (Number(stock) < 0) {
      const error = new Error('El stock no puede ser negativo');
      error.statusCode = 400;
      throw error;
    }

    // Regla de negocio: determinación automática del estado según el stock usando constantes
    const numericStock = Number(stock);
    const status = numericStock > 0 ? PRODUCT_STATUS.AVAILABLE : PRODUCT_STATUS.OUT_OF_STOCK;

    const newProduct = {
      title: title.trim(),
      description: description.trim(),
      price: Number(price),
      stock: numericStock,
      category: category.trim(),
      status,
    };

    return await this.productRepository.create(newProduct);
  }

  /**
   * Actualiza un producto existente.
   * Recalcula el estado en base al nuevo stock si este fue modificado.
   */
  async updateProduct(id, updateData) {
    // Verificamos si el producto existe antes de actualizar
    await this.getProductById(id);

    const dataToUpdate = { ...updateData };

    if (dataToUpdate.price !== undefined && Number(dataToUpdate.price) < 0) {
      const error = new Error('El precio no puede ser negativo');
      error.statusCode = 400;
      throw error;
    }

    if (dataToUpdate.stock !== undefined) {
      const numericStock = Number(dataToUpdate.stock);
      if (numericStock < 0) {
        const error = new Error('El stock no puede ser negativo');
        error.statusCode = 400;
        throw error;
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
