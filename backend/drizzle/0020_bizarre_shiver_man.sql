CREATE TABLE `userArtistShowcase` (
	`id` integer PRIMARY KEY NOT NULL,
	`user` text NOT NULL,
	`artist` integer NOT NULL,
	`addDate` text NOT NULL,
	FOREIGN KEY (`user`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`artist`) REFERENCES `artists`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `userArtistShowcase_user_artist_unique` ON `userArtistShowcase` (`user`,`artist`);