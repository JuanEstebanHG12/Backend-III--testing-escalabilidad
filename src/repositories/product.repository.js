import { ProductModel } from '../models/product.model.js';

/**
 * Capa Repository de Productos:
 * Es el único punto del sistema que interactúa directamente con Mongoose.
 * Encapsula la persistencia, proyecciones para excluir campos internos (__v) y ordenamiento por defecto.
 * IMPORTANTE: No contiene lógica de negocio (no decide si un producto se puede comprar ni calcula precios).
 */
export class ProductRepository {
  /**
   * Obtiene todos los productos aplicando filtros opcionales.
   * Encapsula la exclusión de __v y ordena por los más recientes.
   */
  async getAll(filters = {}) {
    return await ProductModel.find(filters).select('-__v').sort({ createdAt: -1 }).lean();
  }

  /**
   * Busca un producto por su ID de MongoDB.
   */
  async getById(id) {
    return await ProductModel.findById(id).select('-__v').lean();
  }

  /**
   * Inserta un nuevo producto en la base de datos.
   */
  async create(productData) {
    const product = await ProductModel.create(productData);
    // Convertimos a objeto plano y quitamos __v
    const productObject = product.toObject();
    delete productObject.__v;
    return productObject;
  }

  /**
   * Actualiza un producto por su ID con validación de esquema.
   */
  async update(id, updateData) {
    return await ProductModel.findByIdAndUpdate(id, updateData, {
      returnDocument: 'after',
      runValidators: true,
    })
      .select('-__v')
      .lean();
  }

  /**
   * Elimina un producto por su ID.
   */
  async delete(id) {
    return await ProductModel.findByIdAndDelete(id).select('-__v').lean();
  }
}
