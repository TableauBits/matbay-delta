ALTER TABLE `userConstitutionParticipation` RENAME TO `userConstitution`;--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_userConstitution` (
	`id` integer PRIMARY KEY NOT NULL,
	`user` text NOT NULL,
	`constitution` integer NOT NULL,
	`joinDate` text NOT NULL,
	FOREIGN KEY (`user`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`constitution`) REFERENCES `constitutions`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_userConstitution`("id", "user", "constitution", "joinDate") SELECT "id", "user", "constitution", "joinDate" FROM `userConstitution`;--> statement-breakpoint
DROP TABLE `userConstitution`;--> statement-breakpoint
ALTER TABLE `__new_userConstitution` RENAME TO `userConstitution`;--> statement-breakpoint
PRAGMA foreign_keys=ON;