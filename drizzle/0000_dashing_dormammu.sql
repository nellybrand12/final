CREATE TABLE "admin_sessions" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"expires_at" timestamp NOT NULL,
	"device_id" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "admin_users" (
	"id" serial PRIMARY KEY NOT NULL,
	"username" varchar(100) NOT NULL,
	"password_hash" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "admin_users_username_unique" UNIQUE("username")
);
--> statement-breakpoint
CREATE TABLE "bookings" (
	"id" serial PRIMARY KEY NOT NULL,
	"booking_reference" varchar(50) NOT NULL,
	"guest_name" text NOT NULL,
	"guest_email" varchar(255) NOT NULL,
	"guest_phone" varchar(50),
	"room_id" integer NOT NULL,
	"check_in_date" date NOT NULL,
	"check_out_date" date NOT NULL,
	"guests_count" integer DEFAULT 2 NOT NULL,
	"special_requests" text,
	"event_type" varchar(255),
	"total_price" numeric(10, 2) NOT NULL,
	"payment_method" varchar(50) DEFAULT 'hotel',
	"payment_transaction_id" varchar(255),
	"status" varchar(50) DEFAULT 'pending' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "bookings_booking_reference_unique" UNIQUE("booking_reference")
);
--> statement-breakpoint
CREATE TABLE "contact_messages" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" varchar(255) NOT NULL,
	"phone" varchar(50),
	"subject" varchar(255),
	"message" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "faqs" (
	"id" serial PRIMARY KEY NOT NULL,
	"category" varchar(100) DEFAULT 'general' NOT NULL,
	"question" text NOT NULL,
	"answer" text NOT NULL,
	"order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "rooms" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" varchar(100) NOT NULL,
	"name" text NOT NULL,
	"name_fr" text DEFAULT '' NOT NULL,
	"name_en" text DEFAULT '' NOT NULL,
	"tagline_fr" text,
	"tagline_en" text,
	"description_fr" text DEFAULT '' NOT NULL,
	"description_en" text DEFAULT '' NOT NULL,
	"category" varchar(50) DEFAULT 'suite' NOT NULL,
	"price_per_night" numeric(10, 2) NOT NULL,
	"max_guests" integer NOT NULL,
	"size_sqm" integer DEFAULT 65,
	"bed_type" varchar(100) DEFAULT 'King Size',
	"image_url" text NOT NULL,
	"gallery_images" jsonb DEFAULT '[]' NOT NULL,
	"amenities" jsonb DEFAULT '[]' NOT NULL,
	"status" varchar(50) DEFAULT 'available' NOT NULL,
	"type" varchar(50) DEFAULT 'room' NOT NULL,
	"total_rooms" integer DEFAULT 5 NOT NULL,
	"available_rooms" integer DEFAULT 5 NOT NULL,
	"in_use_rooms" integer DEFAULT 0 NOT NULL,
	"on_hold_rooms" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "rooms_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "services" (
	"id" varchar(100) PRIMARY KEY NOT NULL,
	"name_fr" text NOT NULL,
	"name_en" text NOT NULL,
	"highlight_fr" text NOT NULL,
	"highlight_en" text NOT NULL,
	"description_fr" text NOT NULL,
	"description_en" text NOT NULL,
	"icon" varchar(50) NOT NULL,
	"cta_text_fr" varchar(100) NOT NULL,
	"cta_text_en" varchar(100) NOT NULL,
	"cta_link" text NOT NULL,
	"order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "site_settings" (
	"key" varchar(100) PRIMARY KEY NOT NULL,
	"value" jsonb NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" varchar(255) NOT NULL,
	"phone" varchar(50),
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "admin_sessions" ADD CONSTRAINT "admin_sessions_user_id_admin_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."admin_users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_room_id_rooms_id_fk" FOREIGN KEY ("room_id") REFERENCES "public"."rooms"("id") ON DELETE no action ON UPDATE no action;