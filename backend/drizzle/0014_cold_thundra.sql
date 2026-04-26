ALTER TABLE `users` RENAME COLUMN "username" TO "handle";--> statement-breakpoint
DROP INDEX `username_idx`;--> statement-breakpoint
CREATE UNIQUE INDEX `handle_idx` ON `users` (`handle`);