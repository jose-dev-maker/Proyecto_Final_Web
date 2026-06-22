import { Router } from 'express';
import { ProductController } from '../controllers/ProductController';
import { authMiddleware } from '../middlewares/authMiddleware';
import { roleGuard } from '../middlewares/roleGuard';
import { validateRequest } from '../middlewares/validateRequest';
import {
  createProductSchema,
  updateProductSchema,
} from '../validators/schemas';

const router = Router();
const productController = new ProductController();

router.use(authMiddleware);

router.get('/', productController.getAll.bind(productController));

router.post(
  '/',
  roleGuard(['ADMIN']),
  validateRequest(createProductSchema),
  productController.create.bind(productController)
);

router.put(
  '/:id',
  roleGuard(['ADMIN']),
  validateRequest(updateProductSchema),
  productController.update.bind(productController)
);

router.delete(
  '/:id',
  roleGuard(['ADMIN']),
  productController.delete.bind(productController)
);

export default router;
