PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_songConstitution` (
	`id` integer PRIMARY KEY NOT NULL,
	`song` integer NOT NULL,
	`user` text NOT NULL,
	`constitution` integer NOT NULL,
	`addDate` text NOT NULL,
	FOREIGN KEY (`song`) REFERENCES `songs`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`user`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`constitution`) REFERENCES `constitutions`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_songConstitution`("id", "song", "user", "constitution", "addDate") SELECT "id", "song", "user", "constitution", "addDate" FROM `songConstitution`;--> statement-breakpoint
DROP TABLE `songConstitution`;--> statement-breakpoint
ALTER TABLE `__new_songConstitution` RENAME TO `songConstitution`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE UNIQUE INDEX `songConstitution_song_user_constitution_unique` ON `songConstitution` (`song`,`user`,`constitution`);