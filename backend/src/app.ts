import express from 'express';
import cors from 'cors';
import { poisRouter } from './modules/pois/router.js';
import { summaryRouter } from './modules/summary/router.js';
import { optionsRouter } from './modules/options/router.js';

export function createApp() {
  const app = express();
  app.use(cors());
  app.use(express.json());

  app.get('/api/health', (_req, res) => res.json({ ok: true }));

  app.use('/api/pois', poisRouter);
  app.use('/api/summary', summaryRouter);
  app.use('/api/options', optionsRouter);

  // Error handler
  app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    console.error(err);
    res.status(500).json({ error: { code: 'INTERNAL', message: 'Unexpected error' } });
  });

  return app;
}
