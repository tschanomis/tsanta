BEGIN;
ALTER TABLE items ALTER COLUMN description DROP NOT NULL;
ALTER TABLE items DROP CONSTRAINT IF EXISTS items_description_check;
ALTER TABLE items ADD CONSTRAINT items_description_check CHECK (char_length(trim(description)) <= 2000);
ALTER TABLE items ADD COLUMN IF NOT EXISTS url text;
ALTER TABLE items DROP CONSTRAINT IF EXISTS items_url_check;
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = current_schema() AND table_name = 'items'
      AND column_name = 'url' AND data_type = 'text'
  ) THEN
    ALTER TABLE items ADD CONSTRAINT items_url_check CHECK (char_length(url) <= 2048 AND url ~* '^https?://[^[:space:]]+$');
  END IF;
END $$;
COMMIT;
