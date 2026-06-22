import { Router } from 'express';
import { ProductController } from '../controllers/ProductController';
import { authMiddleware } from '../middlewares/authMiddleware';
import { roleGuard } from '../middlewares/roleGuard';

const router = Router();
const productController = new ProductController();

router.use(authMiddleware);

router.get(
  '/low-stock',
  roleGuard(['ADMIN']),
  productController.getLowStock.bind(productController)
);

export default router;
