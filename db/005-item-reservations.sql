BEGIN;
ALTER TABLE items ADD COLUMN IF NOT EXISTS reserved_by uuid REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE items DROP CONSTRAINT IF EXISTS items_reservation_owner_check;
ALTER TABLE items ADD CONSTRAINT items_reservation_owner_check CHECK (reserved_by IS NULL OR reserved_by <> user_id);
COMMIT;
