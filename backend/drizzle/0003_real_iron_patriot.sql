CREATE TABLE `constitutions` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`description` text NOT NULL,
	`owner` text,
	`creationDate` text NOT NULL,
	FOREIGN KEY (`owner`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `userConstitutionParticipation` (
	`id` text PRIMARY KEY NOT NULL,
	`user` text NOT NULL,
	`constitution` text NOT NULL,
	`joinDate` text NOT NULL,
	FOREIGN KEY (`user`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`constitution`) REFERENCES `constitutions`(`id`) ON UPDATE no action ON DELETE no action
);
