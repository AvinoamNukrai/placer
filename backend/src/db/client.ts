import fs from 'fs';
import path from 'path';
import initSqlJs, { Database } from 'sql.js';

let dbPromise: Promise<Database> | null = null;

function resolveDbPath(): string {
  const candidates = [
    path.resolve(process.cwd(), 'data', 'bigbox.sqlite'),
    path.resolve(process.cwd(), '..', 'data', 'bigbox.sqlite'),
    path.resolve(process.cwd(), '../..', 'data', 'bigbox.sqlite'),
  ];
  for (const p of candidates) {
    if (fs.existsSync(p)) return p;
  }
  throw new Error(`bigbox.sqlite not found in expected locations:\n${candidates.join('\n')}`);
}

export async function getDb(): Promise<Database> {
  if (!dbPromise) {
    dbPromise = (async () => {
      const SQL = await initSqlJs({});
      const dbPath = resolveDbPath();
      const buf = fs.readFileSync(dbPath);
      return new SQL.Database(new Uint8Array(buf));
    })();
  }
  return dbPromise;
}

export function execRows(db: Database, sql: string, params?: Record<string, any>): any[] {
  // sql.js supports named parameters ($param). We use a simple wrapper to bind them.
  const stmt = db.prepare(sql);
  try {
    if (params) stmt.bind(params);
    const rows: any[] = [];
    while (stmt.step()) {
      const row = stmt.getAsObject();
      rows.push(row);
    }
    return rows;
  } finally {
    stmt.free();
  }
}
