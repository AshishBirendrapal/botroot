import { Router, Request, Response } from 'express';
import { isDbConnected } from '../config/db.ts';

const router = Router();

router.get('/', (req: Request, res: Response) => {
  const uptimeSeconds = Math.floor(process.uptime());

  res.json({
    status: 'healthy',
    service: 'Mitti2Market Backend API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    uptime: `${uptimeSeconds} seconds`,
    database: {
      connected: isDbConnected(),
      mode: isDbConnected() ? 'MongoDB Connection Active' : 'Memory Cache Fallback Active',
    },
    system: {
      state: 'Uttar Pradesh (Agmarknet Mandi Integration)',
      environment: process.env.NODE_ENV || 'development',
    },
  });
});

export default router;
