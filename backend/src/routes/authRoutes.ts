import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';
import { validateRequest } from '../middlewares/validateRequest';
import { registerSchema, loginSchema } from '../validators/schemas';

const router = Router();
const authController = new AuthController();

router.post(
  '/register',
  validateRequest(registerSchema),
  authController.register.bind(authController)
);

router.post(
  '/login',
  validateRequest(loginSchema),
  authController.login.bind(authController)
);

export default router;
