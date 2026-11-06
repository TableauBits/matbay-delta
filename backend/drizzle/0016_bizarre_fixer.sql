PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_artistAlbum` (
	`artist` integer NOT NULL,
	`album` integer NOT NULL,
	PRIMARY KEY(`artist`, `album`),
	FOREIGN KEY (`artist`) REFERENCES `artists`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`album`) REFERENCES `albums`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_artistAlbum`("artist", "album") SELECT "artist", "album" FROM `artistAlbum`;--> statement-breakpoint
DROP TABLE `artistAlbum`;--> statement-breakpoint
ALTER TABLE `__new_artistAlbum` RENAME TO `artistAlbum`;--> statement-breakpoint
CREATE TABLE `__new_songAlbum` (
	`song` integer NOT NULL,
	`album` integer NOT NULL,
	PRIMARY KEY(`song`, `album`),
	FOREIGN KEY (`song`) REFERENCES `songs`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`album`) REFERENCES `albums`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_songAlbum`("song", "album") SELECT "song", "album" FROM `songAlbum`;--> statement-breakpoint
DROP TABLE `songAlbum`;--> statement-breakpoint
ALTER TABLE `__new_songAlbum` RENAME TO `songAlbum`;--> statement-breakpoint
CREATE TABLE `__new_songArtist` (
	`song` integer NOT NULL,
	`artist` integer NOT NULL,
	`contribution` text DEFAULT 'main' NOT NULL,
	PRIMARY KEY(`song`, `artist`, `contribution`),
	FOREIGN KEY (`song`) REFERENCES `songs`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`artist`) REFERENCES `artists`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_songArtist`("song", "artist", "contribution") SELECT "song", "artist", "contribution" FROM `songArtist`;--> statement-breakpoint
DROP TABLE `songArtist`;--> statement-breakpoint
ALTER TABLE `__new_songArtist` RENAME TO `songArtist`;--> statement-breakpoint
CREATE TABLE `__new_songConstitution` (
	`song` integer NOT NULL,
	`user` text NOT NULL,
	`constitution` integer NOT NULL,
	`addDate` text NOT NULL,
	PRIMARY KEY(`constitution`, `song`),
	FOREIGN KEY (`song`) REFERENCES `songs`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`user`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`constitution`) REFERENCES `constitutions`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_songConstitution`("song", "user", "constitution", "addDate") SELECT "song", "user", "constitution", "addDate" FROM `songConstitution`;--> statement-breakpoint
DROP TABLE `songConstitution`;--> statement-breakpoint
ALTER TABLE `__new_songConstitution` RENAME TO `songConstitution`;--> statement-breakpoint
CREATE TABLE `__new_songLanguage` (
	`creationDate` text NOT NULL,
	`song` integer NOT NULL,
	`language` text NOT NULL,
	PRIMARY KEY(`song`, `language`),
	FOREIGN KEY (`song`) REFERENCES `songs`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_songLanguage`("creationDate", "song", "language") SELECT "creationDate", "song", "language" FROM `songLanguage`;--> statement-breakpoint
DROP TABLE `songLanguage`;--> statement-breakpoint
ALTER TABLE `__new_songLanguage` RENAME TO `songLanguage`;--> statement-breakpoint
CREATE TABLE `__new_songSource` (
	`creationDate` text NOT NULL,
	`song` integer NOT NULL,
	`sourceID` text NOT NULL,
	`platform` text NOT NULL,
	PRIMARY KEY(`song`, `platform`, `sourceID`),
	FOREIGN KEY (`song`) REFERENCES `songs`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_songSource`("creationDate", "song", "sourceID", "platform") SELECT "creationDate", "song", "sourceID", "platform" FROM `songSource`;--> statement-breakpoint
DROP TABLE `songSource`;--> statement-breakpoint
ALTER TABLE `__new_songSource` RENAME TO `songSource`;--> statement-breakpoint
CREATE TABLE `__new_userConstitution` (
	`user` text NOT NULL,
	`constitution` integer NOT NULL,
	`joinDate` text NOT NULL,
	PRIMARY KEY(`constitution`, `user`),
	FOREIGN KEY (`user`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`constitution`) REFERENCES `constitutions`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_userConstitution`("user", "constitution", "joinDate") SELECT "user", "constitution", "joinDate" FROM `userConstitution`;--> statement-breakpoint
DROP TABLE `userConstitution`;--> statement-breakpoint
ALTER TABLE `__new_userConstitution` RENAME TO `userConstitution`;--> statement-breakpoint
PRAGMA foreign_keys=ON;