import { Router } from 'express';
import {
  MandiController,
  getPricesSchema,
  distanceCalcSchema,
  netRealizationSchema,
  compareMandisSchema,
} from '../controllers/mandiController.ts';
import { validate } from '../middleware/validate.ts';

const router = Router();

// Price fetching & filters
router.get('/prices', validate(getPricesSchema), MandiController.getPrices);
router.get('/commodities', MandiController.getCommodities);
router.get('/districts', MandiController.getDistrictsAndMarkets);

// Calculations & Comparisons
router.post('/distance', validate(distanceCalcSchema), MandiController.calculateDistance);
router.post(
  '/calculate-net-realization',
  validate(netRealizationSchema),
  MandiController.calculateNetRealization
);
router.post('/compare', validate(compareMandisSchema), MandiController.compareMandis);

export default router;
