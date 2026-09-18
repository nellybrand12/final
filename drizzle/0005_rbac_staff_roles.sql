-- Migration 0005: rename legacy role values to the new RBAC naming convention
-- 'super-admin' -> 'super_admin'   (Leblanc and any other super admins)
-- 'admin'       -> 'staff'         (all regular admin accounts)
-- The schema default is also changed to 'staff' in schema.ts.

UPDATE "admin_users" SET "role" = 'super_admin' WHERE "role" = 'super-admin';
--> statement-breakpoint
UPDATE "admin_users" SET "role" = 'staff' WHERE "role" = 'admin';
