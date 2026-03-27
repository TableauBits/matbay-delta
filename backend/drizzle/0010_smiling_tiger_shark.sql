CREATE TABLE `albums` (
	`id` integer PRIMARY KEY NOT NULL,
	`creationDate` text NOT NULL,
	`title` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `songs_title_primaryArtist_unique` ON `songs` (`title`,`primaryArtist`);