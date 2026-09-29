import { Router } from 'express';
import {
  CropController,
  createCropSchema,
  updateCropSchema,
} from '../controllers/cropController.ts';
import { authenticate, authorizeRoles } from '../middleware/auth.ts';
import { validate } from '../middleware/validate.ts';

const router = Router();

// Public marketplace viewing
router.get('/', CropController.getAllCrops);
router.get('/:id', CropController.getCropById);

// Farmer specific routes
router.post(
  '/',
  authenticate,
  authorizeRoles('farmer', 'admin'),
  validate(createCropSchema),
  CropController.createCrop
);
router.get('/farmer/my', authenticate, authorizeRoles('farmer', 'admin'), CropController.getMyCrops);
router.put(
  '/:id',
  authenticate,
  authorizeRoles('farmer', 'admin'),
  validate(updateCropSchema),
  CropController.updateCrop
);
router.delete(
  '/:id',
  authenticate,
  authorizeRoles('farmer', 'admin'),
  CropController.deleteCrop
);

export default router;
