ALTER TABLE `users` ADD `displayName` text NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX `username_idx` ON `users` (`username`);