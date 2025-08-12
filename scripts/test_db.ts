import fs from 'fs';
import path from 'path';
import initSqlJs from 'sql.js';

async function run() {
  const DB_PATH = path.resolve(__dirname, '..', 'data', 'bigbox.sqlite');
  if (!fs.existsSync(DB_PATH)) {
    console.error('DB file not found at', DB_PATH);
    process.exit(1);
  }
  const SQL = await initSqlJs({});
  const data = fs.readFileSync(DB_PATH);
  const db = new SQL.Database(new Uint8Array(data));

  function execRows(sql: string) {
    const res = db.exec(sql);
    if (!res.length) return [];
    const [{ columns, values }] = res;
    return values.map((row) => Object.fromEntries(row.map((v: any, i: number) => [columns[i], v])));
  }

  const [{ c: venueCount }] = execRows('SELECT COUNT(*) AS c FROM venues');
  const [{ c: openCount }] = execRows('SELECT COUNT(*) AS c FROM venues_view WHERE is_open = 1');
  const distinctChains = execRows('SELECT chain_name, COUNT(*) AS n FROM venues GROUP BY chain_name ORDER BY n DESC');
  const sample = execRows('SELECT entity_id, name, chain_name, dma, city, state_code, foot_traffic as visits FROM venues LIMIT 5');

  console.log('Rows in venues:', venueCount);
  console.log('Open venues (derived):', openCount);
  console.log('Distinct chains:', distinctChains.length);
  console.log('Top chains (by count):', distinctChains.slice(0, 5));
  console.log('Sample rows:', sample);

  if (venueCount > 0 && sample.length > 0) {
    console.log('OK: Database looks healthy.');
    process.exit(0);
  } else {
    console.error('ERR: Database appears empty or unreadable.');
    process.exit(2);
  }
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
