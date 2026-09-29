import express, { Request, Response } from 'express';
import cors from 'cors';
import { createServer as createViteServer } from 'vite';
import { config } from './server/config/env.ts';
import { connectDB } from './server/config/db.ts';
import { errorHandler } from './server/middleware/errorHandler.ts';

// Route Imports
import authRoutes from './server/routes/authRoutes.ts';
import mandiRoutes from './server/routes/mandiRoutes.ts';
import cropRoutes from './server/routes/cropRoutes.ts';
import buyerRoutes from './server/routes/buyerRoutes.ts';
import adminRoutes from './server/routes/adminRoutes.ts';
import healthRoutes from './server/routes/healthRoutes.ts';
import docRoutes from './server/docs/apiDocumentation.ts';

async function startServer() {
  const app = express();

  // Connect Database (graceful memory fallback if local MongoDB service is offline)
  await connectDB();

  // Security & Parsing Middlewares
  app.use(
    cors({
      origin: config.corsOrigin === '*' ? true : config.corsOrigin,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    })
  );

  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Request logger in dev
  if (config.nodeEnv === 'development') {
    app.use((req, res, next) => {
      if (req.url.startsWith('/api')) {
        console.log(`[API] ${req.method} ${req.url}`);
      }
      next();
    });
  }

  // Mount API Endpoints under /api
  app.use('/api/health', healthRoutes);
  app.use('/api/docs', docRoutes);
  app.use('/api/auth', authRoutes);
  app.use('/api/mandi', mandiRoutes);
  app.use('/api/crops', cropRoutes);
  app.use('/api/buyers', buyerRoutes);
  app.use('/api/admin', adminRoutes);

  // Catch unmatched API routes with 404 JSON
  app.use('/api/*', (req: Request, res: Response) => {
    res.status(404).json({
      success: false,
      message: `API route not found: ${req.method} ${req.baseUrl}`,
      availableEndpoints: '/api/docs',
    });
  });

  // Global Error Handler for API errors
  app.use(errorHandler);

  // Mount Vite development server as middleware (Zero disruption to existing frontend)
  if (config.nodeEnv !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Production static serving
    app.use(express.static('dist'));
    app.get('*', (req, res) => {
      res.sendFile('dist/index.html', { root: '.' });
    });
  }

  const PORT = config.port;
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`====================================================`);
    console.log(` Mitti2Market Server running on port ${PORT}`);
    console.log(` API Health Check:  http://0.0.0.0:${PORT}/api/health`);
    console.log(` API Documentation: http://0.0.0.0:${PORT}/api/docs`);
    console.log(`====================================================`);
  });
}

startServer().catch((err) => {
  console.error('[Server] Fatal startup error:', err);
  process.exit(1);
});
