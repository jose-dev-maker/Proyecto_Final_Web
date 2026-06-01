import { Router } from 'express';
import { OrderController } from '../controllers/OrderController';
import { authMiddleware } from '../middlewares/authMiddleware';
import { validateRequest } from '../middlewares/validateRequest';
import {
  createOrderSchema,
  updateOrderStatusSchema,
} from '../validators/schemas';

const router = Router();
const orderController = new OrderController();

router.use(authMiddleware);

router.post(
  '/',
  validateRequest(createOrderSchema),
  orderController.create.bind(orderController)
);

router.get('/:id', orderController.getById.bind(orderController));

router.patch(
  '/:id/status',
  validateRequest(updateOrderStatusSchema),
  orderController.updateStatus.bind(orderController)
);

export default router;
