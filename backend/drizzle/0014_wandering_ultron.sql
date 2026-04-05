CREATE TABLE `favorite` (
	`id` integer PRIMARY KEY NOT NULL,
	`creationDate` text NOT NULL,
	`user` text NOT NULL,
	`songConstitution` integer NOT NULL,
	FOREIGN KEY (`user`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`songConstitution`) REFERENCES `songConstitution`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `favorite_user_songConstitution_unique` ON `favorite` (`user`,`songConstitution`);