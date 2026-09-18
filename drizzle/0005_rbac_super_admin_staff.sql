DO $$ BEGIN
  CREATE TYPE "admin_role" AS ENUM('super_admin', 'staff');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "admin_users" ADD COLUMN IF NOT EXISTS "is_active" boolean DEFAULT true NOT NULL;
--> statement-breakpoint
UPDATE "admin_users" SET "role" = 'super_admin' WHERE "role" = 'super-admin' OR "username" = 'Leblanc';
--> statement-breakpoint
UPDATE "admin_users" SET "role" = 'staff' WHERE "role" NOT IN ('super_admin', 'staff');
--> statement-breakpoint
ALTER TABLE "admin_users" ALTER COLUMN "role" DROP DEFAULT;
--> statement-breakpoint
ALTER TABLE "admin_users" ALTER COLUMN "role" TYPE "admin_role" USING "role"::"admin_role";
--> statement-breakpoint
ALTER TABLE "admin_users" ALTER COLUMN "role" SET DEFAULT 'staff'::"admin_role";
--> statement-breakpoint
ALTER TABLE "admin_users" ALTER COLUMN "role" SET NOT NULL;
--> statement-breakpoint
UPDATE "admin_users" SET "role" = 'super_admin' WHERE "username" = 'Leblanc';
