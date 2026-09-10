CREATE TABLE "booking_extensions" (
	"id" serial PRIMARY KEY NOT NULL,
	"booking_id" integer NOT NULL,
	"requested_checkout_date" date NOT NULL,
	"additional_charge" numeric(10, 2) NOT NULL,
	"status" varchar(50) DEFAULT 'pending' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "rooms" ADD COLUMN "force_available" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "booking_extensions" ADD CONSTRAINT "booking_extensions_booking_id_bookings_id_fk" FOREIGN KEY ("booking_id") REFERENCES "public"."bookings"("id") ON DELETE no action ON UPDATE no action;