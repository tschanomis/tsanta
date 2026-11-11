BEGIN;
CREATE TABLE IF NOT EXISTS allowed_emails (
  email text PRIMARY KEY CHECK (email = lower(trim(email))),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY,
  email text NOT NULL UNIQUE CHECK (email = lower(trim(email))),
  password_hash text NOT NULL,
  failed_attempts integer NOT NULL DEFAULT 0,
  locked_until timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
-- Préserve les comptes créés avec la version utilisant une liste TypeScript.
INSERT INTO allowed_emails (email) SELECT email FROM users
ON CONFLICT (email) DO NOTHING;
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'users'::regclass AND conname = 'users_email_fkey'
  ) THEN
    ALTER TABLE users ADD CONSTRAINT users_email_fkey
      FOREIGN KEY (email) REFERENCES allowed_emails(email) ON DELETE CASCADE;
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS sessions (
  token_hash text PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS sessions_user_id_idx ON sessions(user_id);
CREATE INDEX IF NOT EXISTS sessions_expires_at_idx ON sessions(expires_at);
COMMIT;
