CREATE TABLE `artistCountry` (
	`id` integer PRIMARY KEY NOT NULL,
	`creationDate` text NOT NULL,
	`artist` integer NOT NULL,
	`country` text NOT NULL,
	FOREIGN KEY (`artist`) REFERENCES `artists`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `artistCountry_artist_country_unique` ON `artistCountry` (`artist`,`country`);