BEGIN;
CREATE TABLE IF NOT EXISTS items (
  id uuid PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title text NOT NULL CHECK (char_length(trim(title)) BETWEEN 1 AND 100),
  description text NOT NULL CHECK (char_length(trim(description)) BETWEEN 1 AND 2000),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS items_user_created_idx ON items(user_id, created_at DESC);
COMMIT;
