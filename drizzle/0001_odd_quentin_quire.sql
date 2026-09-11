CREATE TABLE `bookings` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`reference` text NOT NULL,
	`item_id` integer NOT NULL,
	`customer_name` text NOT NULL,
	`customer_email` text NOT NULL,
	`customer_phone` text NOT NULL,
	`id_type` text NOT NULL,
	`id_number` text NOT NULL,
	`note` text,
	`collection_mode` text NOT NULL,
	`start_date` text NOT NULL,
	`return_date` text NOT NULL,
	`rental_fee` integer NOT NULL,
	`delivery_fee` integer DEFAULT 0 NOT NULL,
	`deposit` integer NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`payment_reference` text,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	FOREIGN KEY (`item_id`) REFERENCES `items`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `bookings_reference_unique` ON `bookings` (`reference`);--> statement-breakpoint
CREATE INDEX `bookings_item_status_idx` ON `bookings` (`item_id`,`status`);--> statement-breakpoint
CREATE INDEX `bookings_dates_idx` ON `bookings` (`start_date`,`return_date`);