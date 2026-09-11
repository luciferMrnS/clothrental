CREATE TABLE `items` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`slug` text NOT NULL,
	`name` text NOT NULL,
	`description` text NOT NULL,
	`occasions` text NOT NULL,
	`price_per_rental` integer NOT NULL,
	`deposit` integer NOT NULL,
	`sizes` text NOT NULL,
	`colors` text NOT NULL,
	`images` text NOT NULL,
	`fit` text NOT NULL,
	`care_notes` text,
	`is_available` integer DEFAULT true NOT NULL,
	`is_featured` integer DEFAULT false NOT NULL,
	`created_at` text DEFAULT (datetime('now')) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `items_slug_unique` ON `items` (`slug`);