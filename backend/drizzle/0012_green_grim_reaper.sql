PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_constitutions` (
	`id` integer PRIMARY KEY NOT NULL,
	`creationDate` text NOT NULL,
	`name` text NOT NULL,
	`description` text NOT NULL,
	`owner` text NOT NULL,
	FOREIGN KEY (`owner`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_constitutions`("id", "creationDate", "name", "description", "owner") SELECT "id", "creationDate", "name", "description", "owner" FROM `constitutions`;--> statement-breakpoint
DROP TABLE `constitutions`;--> statement-breakpoint
ALTER TABLE `__new_constitutions` RENAME TO `constitutions`;--> statement-breakpoint
PRAGMA foreign_keys=ON;