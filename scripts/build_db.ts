/*
  build_db.ts
  - Creates/overwrites SQLite database at data/bigbox.sqlite using sql.js (WASM)
  - Reads CSV at Hands-On Exercise/Bigbox Stores Metrics.csv
  - Applies schema from data/schema.sql
  - Bulk inserts rows with type coercion and trimming
*/

import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse';
import initSqlJs, { Database, SqlJsStatic } from 'sql.js';

const ROOT = path.resolve(__dirname, '..');
const CSV_PATH = path.resolve(ROOT, 'Hands-On Exercise', 'Bigbox Stores Metrics.csv');
const DB_PATH = path.resolve(ROOT, 'data', 'bigbox.sqlite');
const SCHEMA_PATH = path.resolve(ROOT, 'data', 'schema.sql');

function coerceNumber(value: string | undefined): number | null {
  if (value == null) return null;
  const v = value.trim();
  if (v === '') return null;
  const num = Number(v);
  return Number.isFinite(num) ? num : null;
}

function coerceInteger(value: string | undefined): number | null {
  const num = coerceNumber(value);
  if (num == null) return null;
  return Math.trunc(num);
}

function coerceText(value: string | undefined): string | null {
  if (value == null) return null;
  const v = value.trim();
  return v === '' ? null : v;
}

async function main() {
  // Ensure folders exist
  fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });

  const SQL: SqlJsStatic = await initSqlJs({});
  const db: Database = new SQL.Database();

  try {
    const schemaSql = fs.readFileSync(SCHEMA_PATH, 'utf8');
    db.run(schemaSql);

    const insert = db.prepare(`
      INSERT INTO venues (
        entity_id, entity_type, name, foot_traffic, sales, avg_dwell_time_min, area_sqft, ft_per_sqft,
        geolocation, country, state_code, state_name, city, postal_code, formatted_city, street_address,
        sub_category, dma, cbsa, chain_id, chain_name, store_id, date_opened, date_closed
      ) VALUES (
        $entity_id, $entity_type, $name, $foot_traffic, $sales, $avg_dwell_time_min, $area_sqft, $ft_per_sqft,
        $geolocation, $country, $state_code, $state_name, $city, $postal_code, $formatted_city, $street_address,
        $sub_category, $dma, $cbsa, $chain_id, $chain_name, $store_id, $date_opened, $date_closed
      );
    `);

    // Stream CSV
    const parser = fs
      .createReadStream(CSV_PATH)
      .pipe(parse({ columns: true, bom: true, skip_empty_lines: true, trim: true }));

    let total = 0;

    for await (const record of parser) {
      const row = {
        $entity_id: coerceText(record.entity_id),
        $entity_type: coerceText(record.entity_type) ?? 'venue',
        $name: coerceText(record.name)!,
        $foot_traffic: coerceInteger(record.foot_traffic) ?? 0,
        $sales: coerceNumber(record.sales),
        $avg_dwell_time_min: coerceNumber(record.avg_dwell_time_min),
        $area_sqft: coerceNumber(record.area_sqft),
        $ft_per_sqft: coerceNumber(record.ft_per_sqft),
        $geolocation: coerceText(record.geolocation),
        $country: coerceText(record.country),
        $state_code: coerceText(record.state_code),
        $state_name: coerceText(record.state_name),
        $city: coerceText(record.city),
        $postal_code: coerceText(record.postal_code),
        $formatted_city: coerceText(record.formatted_city),
        $street_address: coerceText(record.street_address),
        $sub_category: coerceText(record.sub_category),
        $dma: coerceInteger(record.dma),
        $cbsa: coerceInteger(record.cbsa),
        $chain_id: coerceText(record.chain_id),
        $chain_name: coerceText(record.chain_name),
        $store_id: coerceText(record.store_id),
        $date_opened: coerceText(record.date_opened),
        $date_closed: coerceText(record.date_closed),
      } as const;

      if (!row.$entity_id || !row.$name) continue;
      insert.run(row);
      total++;
    }

    insert.free();

    const chainCount = db.exec('SELECT COUNT(DISTINCT chain_name) as c FROM venues')[0]?.values[0][0] ?? 0;
    const dmaCount = db.exec('SELECT COUNT(DISTINCT dma) as c FROM venues WHERE dma IS NOT NULL')[0]?.values[0][0] ?? 0;

    const data = db.export();
    fs.writeFileSync(DB_PATH, Buffer.from(data));

    console.log(`Inserted ${total} rows. Distinct chains: ${chainCount}. Distinct DMAs: ${dmaCount}.`);
    console.log(`Database written to ${DB_PATH}`);
  } finally {
    db.close();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
