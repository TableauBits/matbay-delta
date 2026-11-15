CREATE TABLE `userSongShowcase` (
	`id` integer PRIMARY KEY NOT NULL,
	`user` text NOT NULL,
	`song` integer NOT NULL,
	`addDate` text NOT NULL,
	FOREIGN KEY (`user`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`song`) REFERENCES `songs`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `userSongShowcase_user_song_unique` ON `userSongShowcase` (`user`,`song`);