import { ProductService } from '../services/product.service.js';

/**
 * Capa Controller de Productos:
 * Única puerta de entrada HTTP para la entidad Productos.
 * Maneja req y res, códigos de estado HTTP y delega la lógica de negocio al Service.
 * NUNCA importa Mongoose directamente.
 */
export class ProductController {
  constructor() {
    this.productService = new ProductService();
  }

  /**
   * GET /api/products
   */
  getAll = async (req, res, next) => {
    try {
      const products = await this.productService.getAllProducts(req.query);
      return res.status(200).json({
        success: true,
        data: products,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/products/:id
   */
  getById = async (req, res, next) => {
    try {
      const { id } = req.params;
      const product = await this.productService.getProductById(id);
      return res.status(200).json({
        success: true,
        data: product,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /api/products
   */
  create = async (req, res, next) => {
    try {
      const newProduct = await this.productService.createProduct(req.body);
      return res.status(201).json({
        success: true,
        message: 'Producto creado exitosamente',
        data: newProduct,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * PUT /api/products/:id
   */
  update = async (req, res, next) => {
    try {
      const { id } = req.params;
      const updatedProduct = await this.productService.updateProduct(id, req.body);
      return res.status(200).json({
        success: true,
        message: 'Producto actualizado exitosamente',
        data: updatedProduct,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * DELETE /api/products/:id
   */
  delete = async (req, res, next) => {
    try {
      const { id } = req.params;
      await this.productService.deleteProduct(id);
      return res.status(200).json({
        success: true,
        message: 'Producto eliminado exitosamente',
      });
    } catch (error) {
      next(error);
    }
  };
}
