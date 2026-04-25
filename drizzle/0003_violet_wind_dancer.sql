CREATE TABLE `email_verification_tokens` (
	`id` varchar(191) NOT NULL,
	`user_id` varchar(191) NOT NULL,
	`token` varchar(191) NOT NULL,
	`expires_at` timestamp NOT NULL,
	CONSTRAINT `email_verification_tokens_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `password_reset_tokens` (
	`id` varchar(191) NOT NULL,
	`user_id` varchar(191) NOT NULL,
	`token` varchar(191) NOT NULL,
	`expires_at` timestamp NOT NULL,
	CONSTRAINT `password_reset_tokens_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `users` ADD `is_verified` boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `email_verification_tokens` ADD CONSTRAINT `email_verification_tokens_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `password_reset_tokens` ADD CONSTRAINT `password_reset_tokens_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;