import { Router } from 'express';
import { z } from 'zod';
import { getDb, execRows } from '../../db/client.js';

export const poisRouter = Router();

const QuerySchema = z.object({
  chain_name: z.string().trim().min(1).optional(),
  dma: z.coerce.number().int().optional(),
  category: z.string().trim().min(1).optional(),
  is_open: z.enum(['all', 'open', 'closed']).optional().default('all'),
  page: z.coerce.number().int().positive().optional().default(1),
  page_size: z.coerce.number().int().positive().max(100).optional().default(25),
  sort_by: z.enum(['name', 'foot_traffic']).optional().default('foot_traffic'),
  sort_dir: z.enum(['asc', 'desc']).optional().default('desc'),
});

poisRouter.get('/', async (req, res, next) => {
  try {
    const q = QuerySchema.parse(req.query);
    const db = await getDb();

    const where: string[] = [];
    if (q.chain_name) where.push(`LOWER(chain_name) = LOWER($chain_name)`);
    if (q.dma !== undefined) where.push(`dma = $dma`);
    if (q.category) where.push(`LOWER(category) = LOWER($category)`);
    if (q.is_open !== 'all') where.push(`is_open = ${q.is_open === 'open' ? 1 : 0}`);

    const whereSql = where.length ? 'WHERE ' + where.join(' AND ') : '';
    const orderBy = q.sort_by === 'name' ? 'name' : 'visits';
    const sortDir = q.sort_dir.toUpperCase();
    const limit = q.page_size;
    const offset = (q.page - 1) * q.page_size;

    const params: any = {};
    if (q.chain_name) params.$chain_name = q.chain_name;
    if (q.dma !== undefined) params.$dma = q.dma;
    if (q.category) params.$category = q.category;

    const items = execRows(
      db,
      `SELECT entity_id, name, chain_name, category, dma, city, state, visits, is_open
       FROM venues_view
       ${whereSql}
       ORDER BY ${orderBy} ${sortDir}
       LIMIT ${limit} OFFSET ${offset}`,
      params
    );

    const [{ total_count }] = execRows(
      db,
      `SELECT COUNT(*) AS total_count FROM venues_view ${whereSql}`,
      params
    );

    res.json({ items, page: q.page, page_size: q.page_size, total_count });
  } catch (e) {
    next(e);
  }
});
