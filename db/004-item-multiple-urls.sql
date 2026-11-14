BEGIN;
ALTER TABLE items DROP CONSTRAINT IF EXISTS items_url_check;
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = current_schema() AND table_name = 'items'
      AND column_name = 'url' AND data_type = 'text'
  ) THEN
    ALTER TABLE items ALTER COLUMN url TYPE text[]
      USING CASE WHEN url IS NULL THEN ARRAY[]::text[] ELSE ARRAY[url] END;
  END IF;
END $$;
ALTER TABLE items ALTER COLUMN url SET DEFAULT ARRAY[]::text[];
UPDATE items SET url = ARRAY[]::text[] WHERE url IS NULL;
ALTER TABLE items ALTER COLUMN url SET NOT NULL;
CREATE OR REPLACE FUNCTION item_urls_valid(urls text[]) RETURNS boolean
LANGUAGE sql IMMUTABLE STRICT AS $$
  SELECT NOT EXISTS (
    SELECT 1 FROM unnest(urls) AS entry(url)
    WHERE url IS NULL OR char_length(url) > 2048 OR url !~* '^https?://[^[:space:]]+$'
  );
$$;
ALTER TABLE items ADD CONSTRAINT items_url_check CHECK (item_urls_valid(url));
COMMIT;
