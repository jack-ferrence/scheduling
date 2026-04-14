DO $$
BEGIN
IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'slot_status') THEN
CREATE TYPE slot_status AS ENUM ('OPEN', 'UNAVAILABLE');
END IF;
END$$;

DO $$
BEGIN
IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'slot_source') THEN
CREATE TYPE slot_source AS ENUM ('GENERATED', 'CALENDAR_BLOCK');
END IF;
END$$;

CREATE TABLE time_slots (
slot_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
facility_id UUID NOT NULL REFERENCES facilities(facility_id) ON DELETE RESTRICT,
start_time TIMESTAMPTZ NOT NULL,
end_time TIMESTAMPTZ NOT NULL,
status slot_status NOT NULL,
source slot_source NOT NULL DEFAULT 'GENERATED',
external_event_id TEXT,
last_synced_at TIMESTAMPTZ NOT NULL DEFAULT now(),
CHECK (end_time > start_time)
);

CREATE UNIQUE INDEX uniq_time_slots_facility_start
ON time_slots (facility_id, start_time);

CREATE INDEX idx_time_slots_facility_time
ON time_slots (facility_id, start_time);

CREATE INDEX idx_time_slots_status_time
ON time_slots (status, start_time);