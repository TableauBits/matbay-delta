CREATE TABLE `songConstitution` (
	`id` integer PRIMARY KEY NOT NULL,
	`url` text NOT NULL,
	`song` text NOT NULL,
	`user` text NOT NULL,
	`constitution` integer NOT NULL,
	`addDate` text NOT NULL,
	FOREIGN KEY (`song`) REFERENCES `songs`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`user`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`constitution`) REFERENCES `constitutions`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `songConstitution_song_user_constitution_unique` ON `songConstitution` (`song`,`user`,`constitution`);--> statement-breakpoint
CREATE TABLE `artistAlbum` (
	`id` integer PRIMARY KEY NOT NULL,
	`artist` integer NOT NULL,
	`album` integer NOT NULL,
	FOREIGN KEY (`artist`) REFERENCES `artists`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`album`) REFERENCES `albums`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `artistAlbum_artist_album_unique` ON `artistAlbum` (`artist`,`album`);--> statement-breakpoint
CREATE TABLE `artists` (
	`id` integer PRIMARY KEY NOT NULL,
	`creationDate` text NOT NULL,
	`name` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `songAlbum` (
	`id` integer PRIMARY KEY NOT NULL,
	`song` integer NOT NULL,
	`album` integer NOT NULL,
	FOREIGN KEY (`song`) REFERENCES `songs`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`album`) REFERENCES `albums`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `songAlbum_song_album_unique` ON `songAlbum` (`song`,`album`);--> statement-breakpoint
CREATE TABLE `songArtist` (
	`id` integer PRIMARY KEY NOT NULL,
	`song` integer NOT NULL,
	`artist` integer NOT NULL,
	`contribution` text DEFAULT 'main' NOT NULL,
	FOREIGN KEY (`song`) REFERENCES `songs`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`artist`) REFERENCES `artists`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `songArtist_artist_song_contribution_unique` ON `songArtist` (`artist`,`song`,`contribution`);--> statement-breakpoint
CREATE TABLE `songs` (
	`id` integer PRIMARY KEY NOT NULL,
	`creationDate` text NOT NULL,
	`title` text NOT NULL,
	`primaryArtist` integer NOT NULL,
	FOREIGN KEY (`primaryArtist`) REFERENCES `artists`(`id`) ON UPDATE no action ON DELETE no action
);
