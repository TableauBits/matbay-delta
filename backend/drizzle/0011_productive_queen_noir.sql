CREATE TABLE `songSource` (
	`id` integer PRIMARY KEY NOT NULL,
	`creationDate` text NOT NULL,
	`song` integer NOT NULL,
	`sourceID` text NOT NULL,
	`platform` text NOT NULL,
	FOREIGN KEY (`song`) REFERENCES `songs`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `songSource_song_sourceID_platform_unique` ON `songSource` (`song`,`sourceID`,`platform`);