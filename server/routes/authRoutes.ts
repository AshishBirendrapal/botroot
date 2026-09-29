import { Router } from 'express';
import {
  AuthController,
  farmerRegisterSchema,
  buyerRegisterSchema,
  loginSchema,
  updateProfileSchema,
} from '../controllers/authController.ts';
import { validate } from '../middleware/validate.ts';
import { authenticate } from '../middleware/auth.ts';

const router = Router();

// Registration
router.post('/farmer/register', validate(farmerRegisterSchema), AuthController.registerFarmer);
router.post('/buyer/register', validate(buyerRegisterSchema), AuthController.registerBuyer);

// Login
router.post('/login', validate(loginSchema), AuthController.login);

// Profile
router.get('/profile', authenticate, AuthController.getProfile);
router.put('/profile', authenticate, validate(updateProfileSchema), AuthController.updateProfile);

export default router;
