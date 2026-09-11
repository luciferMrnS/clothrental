CREATE TABLE "bookings" (
	"id" serial PRIMARY KEY NOT NULL,
	"reference" text NOT NULL,
	"item_id" integer NOT NULL,
	"customer_name" text NOT NULL,
	"customer_email" text NOT NULL,
	"customer_phone" text NOT NULL,
	"id_type" text NOT NULL,
	"id_number" text NOT NULL,
	"note" text,
	"collection_mode" text NOT NULL,
	"start_date" text NOT NULL,
	"return_date" text NOT NULL,
	"rental_fee" integer NOT NULL,
	"delivery_fee" integer DEFAULT 0 NOT NULL,
	"deposit" integer NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"payment_reference" text,
	"created_at" text DEFAULT (now()) NOT NULL,
	CONSTRAINT "bookings_reference_unique" UNIQUE("reference")
);
--> statement-breakpoint
CREATE TABLE "items" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"description" text NOT NULL,
	"occasions" text NOT NULL,
	"price_per_rental" integer NOT NULL,
	"deposit" integer NOT NULL,
	"sizes" text NOT NULL,
	"colors" text NOT NULL,
	"images" text NOT NULL,
	"fit" text NOT NULL,
	"care_notes" text,
	"is_available" boolean DEFAULT true NOT NULL,
	"is_featured" boolean DEFAULT false NOT NULL,
	"created_at" text DEFAULT (now()) NOT NULL,
	CONSTRAINT "items_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_item_id_items_id_fk" FOREIGN KEY ("item_id") REFERENCES "public"."items"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "bookings_item_status_idx" ON "bookings" USING btree ("item_id","status");--> statement-breakpoint
CREATE INDEX "bookings_dates_idx" ON "bookings" USING btree ("start_date","return_date");