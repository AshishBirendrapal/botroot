import { Router } from 'express';
import {
  BuyerController,
  createOfferSchema,
  updateOfferSchema,
} from '../controllers/buyerController.ts';
import { authenticate, authorizeRoles } from '../middleware/auth.ts';
import { validate } from '../middleware/validate.ts';

const router = Router();

// Public / Farmer viewing buyer demands
router.get('/offers', BuyerController.getAllOffers);

// Buyer protected actions
router.post(
  '/offers',
  authenticate,
  authorizeRoles('buyer', 'admin'),
  validate(createOfferSchema),
  BuyerController.createOffer
);
router.get(
  '/offers/my',
  authenticate,
  authorizeRoles('buyer', 'admin'),
  BuyerController.getMyOffers
);
router.put(
  '/offers/:id',
  authenticate,
  authorizeRoles('buyer', 'admin'),
  validate(updateOfferSchema),
  BuyerController.updateOffer
);
router.delete(
  '/offers/:id',
  authenticate,
  authorizeRoles('buyer', 'admin'),
  BuyerController.deleteOffer
);

export default router;
