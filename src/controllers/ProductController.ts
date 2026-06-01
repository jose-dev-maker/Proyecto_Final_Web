import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';
import { ProductService } from '../services/ProductService';

const productService = new ProductService();

export class ProductController {
  async getAll(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const categoryId = req.query.categoryId
        ? parseInt(req.query.categoryId as string)
        : undefined;

      const products = await productService.getAll(categoryId);
      res.status(200).json({ success: true, data: products });
    } catch (error) {
      next(error);
    }
  }

  async create(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const product = await productService.create(req.body);
      res.status(201).json({
        success: true,
        message: 'Producto creado exitosamente',
        data: product,
      });
    } catch (error) {
      next(error);
    }
  }

  async update(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id);
      const product = await productService.update(id, req.body);
      res.status(200).json({
        success: true,
        message: 'Producto actualizado exitosamente',
        data: product,
      });
    } catch (error) {
      next(error);
    }
  }

  async delete(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id);
      await productService.delete(id);
      res.status(200).json({
        success: true,
        message: 'Producto eliminado exitosamente',
      });
    } catch (error) {
      next(error);
    }
  }

  async getLowStock(
    _req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const products = await productService.getLowStock();
      res.status(200).json({ success: true, data: products });
    } catch (error) {
      next(error);
    }
  }
}
