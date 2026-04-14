CREATE TABLE users (
user_id UUID PRIMARY KEY, -- use auth provider UUID if applicable
name TEXT NOT NULL,
email TEXT NOT NULL UNIQUE,
role TEXT NOT NULL DEFAULT 'STUDENT' CHECK (role IN ('STUDENT','ADMIN')),
created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);