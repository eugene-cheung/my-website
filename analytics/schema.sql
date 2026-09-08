CREATE TABLE IF NOT EXISTS views (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  ts            TEXT    NOT NULL,          -- ISO8601 UTC
  visitor       TEXT    NOT NULL,          -- daily-rotating hash of IP+UA (dedupe without a cookie)
  ip            TEXT,
  country       TEXT,
  region        TEXT,
  city          TEXT,
  timezone      TEXT,
  asn           INTEGER,
  org           TEXT,                      -- network owner: ISP, or employer on a corp network
  referrer      TEXT,
  utm           TEXT,
  path          TEXT,
  user_agent    TEXT,
  device        TEXT,
  screen        TEXT,
  language      TEXT,
  sections      TEXT,                      -- sections scrolled into view, comma-separated
  dwell_ms      INTEGER,
  resume_opened INTEGER DEFAULT 0,
  is_bot        INTEGER DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_views_ts      ON views(ts DESC);
CREATE INDEX IF NOT EXISTS idx_views_visitor ON views(visitor);
CREATE INDEX IF NOT EXISTS idx_views_org     ON views(org);
