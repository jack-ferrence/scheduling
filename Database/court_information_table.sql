CREATE TABLE facilities (
facility_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
name TEXT NOT NULL,
capacity INT NOT NULL CHECK (capacity > 0),
is_active BOOLEAN NOT NULL DEFAULT TRUE,
location_text TEXT,
sport_type TEXT
);

CREATE INDEX idx_facilities_active ON facilities(is_active);