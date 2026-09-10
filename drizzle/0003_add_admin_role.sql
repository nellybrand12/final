ALTER TABLE "admin_users" ADD COLUMN "role" varchar(50) DEFAULT 'admin' NOT NULL;
--> statement-breakpoint
UPDATE "admin_users" SET "role" = 'super-admin' WHERE "username" = 'Leblanc';
