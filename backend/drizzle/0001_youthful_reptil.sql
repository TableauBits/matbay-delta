ALTER TABLE `users` ADD `authID` text NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX `authID_idx` ON `users` (`authID`);