CREATE TABLE signups (
signup_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
slot_id UUID NOT NULL REFERENCES time_slots(slot_id) ON DELETE CASCADE,
user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
joined_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- one user can only join a slot once
CREATE UNIQUE INDEX uniq_signups_slot_user
ON signups (slot_id, user_id);

CREATE INDEX idx_signups_slot
ON signups (slot_id);

CREATE INDEX idx_signups_user
ON signups (user_id);