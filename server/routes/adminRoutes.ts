import { Router } from 'express';
import {
  AdminController,
  verifyBuyerSchema,
} from '../controllers/adminController.ts';
import { authenticate, authorizeRoles } from '../middleware/auth.ts';
import { validate } from '../middleware/validate.ts';

const router = Router();

// Admin protection for all administrative actions
router.use(authenticate, authorizeRoles('admin'));

router.get('/stats', AdminController.getStats);
router.get('/buyers/pending', AdminController.getPendingBuyers);
router.patch('/buyers/:id/verify', validate(verifyBuyerSchema), AdminController.verifyBuyer);
router.post('/mandi/sync', AdminController.syncMandiData);

export default router;
