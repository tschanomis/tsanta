BEGIN;
CREATE TABLE IF NOT EXISTS suggestions (
  id uuid PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  theme text NOT NULL CHECK (theme IN ('evenements', 'menu', 'application')),
  body text NOT NULL CHECK (char_length(trim(body)) BETWEEN 1 AND 2000),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz
);
CREATE INDEX IF NOT EXISTS suggestions_theme_created_idx ON suggestions(theme, created_at DESC, id);
COMMIT;
