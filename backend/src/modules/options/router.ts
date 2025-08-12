import { Router } from 'express';
import { getDb, execRows } from '../../db/client.js';

export const optionsRouter = Router();

optionsRouter.get('/', async (_req, res, next) => {
  try {
    const db = await getDb();
    const chains = execRows(db, 'SELECT DISTINCT chain_name FROM venues WHERE chain_name IS NOT NULL ORDER BY chain_name ASC').map(r => r.chain_name);
    const dmas = execRows(db, 'SELECT DISTINCT dma FROM venues WHERE dma IS NOT NULL ORDER BY dma ASC').map(r => r.dma);
    const categories = execRows(db, 'SELECT DISTINCT sub_category as category FROM venues WHERE sub_category IS NOT NULL ORDER BY category ASC').map(r => r.category);
    res.json({ chain_names: chains, dmas, categories });
  } catch (e) {
    next(e);
  }
});
