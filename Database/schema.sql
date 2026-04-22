// the master file. Defines all the tables: users, facilites, time_slots, signups, 
// and facility_bookings (for 25live events). 
// when db:reset is run, this file is executed to drop and recreate all tables with the correct schema.

-- Biola Sports — consolidated schema (run via npm run db:reset)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

DROP TABLE IF EXISTS signups CASCADE;
DROP TABLE IF EXISTS time_slots CASCADE;
DROP TABLE IF EXISTS facility_bookings CASCADE;
DROP TABLE IF EXISTS facilities CASCADE;
DROP TABLE IF EXISTS users CASCADE;

CREATE TABLE users (
  user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE facilities (
  facility_id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  facility_type TEXT NOT NULL CHECK (facility_type IN ('campus', 'park')),
  location_text TEXT NOT NULL,
  sports TEXT[] NOT NULL DEFAULT '{}',
  image_url TEXT NOT NULL,
  description TEXT NOT NULL,
  opening_time TEXT NOT NULL,
  closing_time TEXT NOT NULL,
  amenities TEXT[] NOT NULL DEFAULT '{}',
  parking_available BOOLEAN NOT NULL DEFAULT true,
  accessibility TEXT NOT NULL,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  is_active BOOLEAN NOT NULL DEFAULT true
);

CREATE INDEX idx_facilities_active ON facilities(is_active);

CREATE TABLE time_slots (
  slot_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  facility_id TEXT NOT NULL REFERENCES facilities(facility_id) ON DELETE CASCADE,
  sport TEXT NOT NULL,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  capacity INT NOT NULL CHECK (capacity > 0),
  created_by_user_id UUID REFERENCES users(user_id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (end_time > start_time)
);

CREATE UNIQUE INDEX uniq_time_slots_facility_start ON time_slots (facility_id, start_time);

CREATE INDEX idx_time_slots_facility_time ON time_slots (facility_id, start_time);

CREATE TABLE signups (
  signup_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slot_id UUID NOT NULL REFERENCES time_slots(slot_id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (slot_id, user_id)
);

CREATE INDEX idx_signups_slot ON signups(slot_id);
CREATE INDEX idx_signups_user ON signups(user_id);

-- 25live official bookings (blocked times scraped from CollegeNET)
CREATE TABLE facility_bookings (
  booking_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  facility_id TEXT NOT NULL REFERENCES facilities(facility_id) ON DELETE CASCADE,
  external_id TEXT,                     -- 25live event_id
  event_name TEXT NOT NULL,
  organization TEXT,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  setup_minutes INT NOT NULL DEFAULT 0,  -- pre-event buffer from 25live
  teardown_minutes INT NOT NULL DEFAULT 0,
  event_type TEXT NOT NULL DEFAULT 'other',
  is_public BOOLEAN NOT NULL DEFAULT true,
  scraped_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (end_time > start_time),
  UNIQUE (facility_id, external_id)     -- prevent duplicate scrapes
);

CREATE INDEX idx_facility_bookings_facility_time ON facility_bookings (facility_id, start_time);
CREATE INDEX idx_facility_bookings_time ON facility_bookings (start_time, end_time);
