ALTER TABLE "rooms" ADD COLUMN IF NOT EXISTS "price_per_seat" numeric(10, 2);
--> statement-breakpoint
ALTER TABLE "rooms" ADD COLUMN IF NOT EXISTS "capacity" integer;
--> statement-breakpoint
ALTER TABLE "rooms" ALTER COLUMN "price_per_night" DROP NOT NULL;
--> statement-breakpoint

-- Backfill existing hall records with explicit price_per_seat & capacity, and clear price_per_night
UPDATE "rooms"
SET 
  "price_per_seat" = COALESCE("price_per_seat", "price_per_night", 15000.00),
  "capacity" = COALESCE("capacity", "max_guests", 150),
  "price_per_night" = NULL
WHERE "type" = 'hall';
--> statement-breakpoint

-- Ensure room ID 1 (appartement-superieur) is classified as 'apartment'
UPDATE "rooms"
SET "type" = 'apartment'
WHERE "id" = 1 OR "slug" = 'appartement-superieur';
