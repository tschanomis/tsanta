BEGIN;
ALTER TABLE items ALTER COLUMN description DROP NOT NULL;
ALTER TABLE items DROP CONSTRAINT IF EXISTS items_description_check;
ALTER TABLE items ADD CONSTRAINT items_description_check CHECK (char_length(trim(description)) <= 2000);
ALTER TABLE items ADD COLUMN IF NOT EXISTS url text;
ALTER TABLE items DROP CONSTRAINT IF EXISTS items_url_check;
ALTER TABLE items ADD CONSTRAINT items_url_check CHECK (char_length(url) <= 2048 AND url ~* '^https?://[^[:space:]]+$');
COMMIT;
