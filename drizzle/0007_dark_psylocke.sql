CREATE TABLE `board_transfers` (
	`id` varchar(191) NOT NULL,
	`board_id` varchar(191) NOT NULL,
	`sender_id` varchar(191) NOT NULL,
	`recipient_email` varchar(191) NOT NULL,
	`status` enum('pending','accepted','cancelled') NOT NULL DEFAULT 'pending',
	`created_at` timestamp NOT NULL,
	`updated_at` timestamp NOT NULL,
	CONSTRAINT `board_transfers_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `board_transfers` ADD CONSTRAINT `board_transfers_board_id_boards_id_fk` FOREIGN KEY (`board_id`) REFERENCES `boards`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `board_transfers` ADD CONSTRAINT `board_transfers_sender_id_users_id_fk` FOREIGN KEY (`sender_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;