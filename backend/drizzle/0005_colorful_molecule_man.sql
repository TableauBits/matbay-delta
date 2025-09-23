PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_constitutions` (
	`id` integer PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`description` text NOT NULL,
	`owner` text,
	`creationDate` text NOT NULL,
	FOREIGN KEY (`owner`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_constitutions`("id", "name", "description", "owner", "creationDate") SELECT "id", "name", "description", "owner", "creationDate" FROM `constitutions`;--> statement-breakpoint
DROP TABLE `constitutions`;--> statement-breakpoint
ALTER TABLE `__new_constitutions` RENAME TO `constitutions`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE TABLE `__new_userConstitutionParticipation` (
	`id` integer PRIMARY KEY NOT NULL,
	`user` text NOT NULL,
	`constitution` integer NOT NULL,
	`joinDate` text NOT NULL,
	FOREIGN KEY (`user`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`constitution`) REFERENCES `constitutions`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_userConstitutionParticipation`("id", "user", "constitution", "joinDate") SELECT "id", "user", "constitution", "joinDate" FROM `userConstitutionParticipation`;--> statement-breakpoint
DROP TABLE `userConstitutionParticipation`;--> statement-breakpoint
ALTER TABLE `__new_userConstitutionParticipation` RENAME TO `userConstitutionParticipation`;