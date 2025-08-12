import { Router } from 'express';
import { z } from 'zod';
import { getDb, execRows } from '../../db/client.js';

export const summaryRouter = Router();

const QuerySchema = z.object({
  chain_name: z.string().trim().min(1).optional(),
  dma: z.coerce.number().int().optional(),
  category: z.string().trim().min(1).optional(),
  city: z.string().trim().min(1).optional(),
  state: z.string().trim().min(1).optional(),
  is_open: z.enum(['all', 'open', 'closed']).optional().default('all'),
});

summaryRouter.get('/', async (req, res, next) => {
  try {
    const q = QuerySchema.parse(req.query);
    const db = await getDb();

    const where: string[] = [];
    const params: any = {};

    if (q.chain_name) {
      where.push(`LOWER(chain_name) = LOWER($chain_name)`);
      params.$chain_name = q.chain_name;
    }
    if (q.dma !== undefined) {
      where.push(`dma = $dma`);
      params.$dma = q.dma;
    }
    if (q.category) {
      where.push(`LOWER(category) = LOWER($category)`);
      params.$category = q.category;
    }
    if (q.city) {
      where.push(`LOWER(city) = LOWER($city)`);
      params.$city = q.city;
    }
    if (q.state) {
      where.push(`LOWER(state) = LOWER($state)`);
      params.$state = q.state;
    }
    if (q.is_open !== 'all') where.push(`is_open = ${q.is_open === 'open' ? 1 : 0}`);

    const whereSql = where.length ? 'WHERE ' + where.join(' AND ') : '';

    const [{ total_venues, total_foot_traffic }] = execRows(
      db,
      `SELECT COUNT(*) AS total_venues, SUM(visits) AS total_foot_traffic FROM venues_view ${whereSql}`,
      Object.values(params)
    );

    res.json({ total_venues, total_foot_traffic });
  } catch (e) {
    next(e);
  }
});
