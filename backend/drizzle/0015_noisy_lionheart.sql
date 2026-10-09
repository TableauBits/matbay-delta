CREATE TABLE `songLanguage` (
	`id` integer PRIMARY KEY NOT NULL,
	`creationDate` text NOT NULL,
	`song` integer NOT NULL,
	`language` text NOT NULL,
	FOREIGN KEY (`song`) REFERENCES `songs`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `songLanguage_song_language_unique` ON `songLanguage` (`song`,`language`);