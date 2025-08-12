-- SQLite schema for Big Box Stores dataset
PRAGMA foreign_keys = ON;

DROP TABLE IF EXISTS venues;

CREATE TABLE venues (
  entity_id TEXT PRIMARY KEY,
  entity_type TEXT NOT NULL,
  name TEXT NOT NULL,
  foot_traffic INTEGER NOT NULL DEFAULT 0,
  sales REAL,
  avg_dwell_time_min REAL,
  area_sqft REAL,
  ft_per_sqft REAL,
  geolocation TEXT,
  country TEXT,
  state_code TEXT,
  state_name TEXT,
  city TEXT,
  postal_code TEXT,
  formatted_city TEXT,
  street_address TEXT,
  sub_category TEXT,
  dma INTEGER,
  cbsa INTEGER,
  chain_id TEXT,
  chain_name TEXT,
  store_id TEXT,
  date_opened TEXT,
  date_closed TEXT
);

CREATE INDEX IF NOT EXISTS idx_venues_chain_name ON venues (chain_name);
CREATE INDEX IF NOT EXISTS idx_venues_dma ON venues (dma);
CREATE INDEX IF NOT EXISTS idx_venues_sub_category ON venues (sub_category);
CREATE INDEX IF NOT EXISTS idx_venues_state_code ON venues (state_code);
CREATE INDEX IF NOT EXISTS idx_venues_city ON venues (city);
CREATE INDEX IF NOT EXISTS idx_venues_date_closed ON venues (date_closed);
CREATE INDEX IF NOT EXISTS idx_venues_foot_traffic ON venues (foot_traffic);

-- Optional view that exposes normalized aliases and is_open flag
DROP VIEW IF EXISTS venues_view;
CREATE VIEW venues_view AS
SELECT
  entity_id,
  entity_type,
  name,
  chain_name,
  sub_category AS category,
  dma,
  city,
  state_code AS state,
  foot_traffic AS visits,
  CASE WHEN date_closed IS NULL OR date_closed = '' THEN 1 ELSE 0 END AS is_open,
  -- passthroughs
  sales,
  avg_dwell_time_min,
  area_sqft,
  ft_per_sqft,
  geolocation,
  country,
  state_name,
  postal_code,
  formatted_city,
  street_address,
  cbsa,
  chain_id,
  store_id,
  date_opened,
  date_closed
FROM venues;