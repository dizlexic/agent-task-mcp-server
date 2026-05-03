CREATE TABLE `board_columns` (
	`id` varchar(191) NOT NULL,
	`board_id` varchar(191) NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`instructions` text,
	`order` int NOT NULL DEFAULT 0,
	`created_at` timestamp NOT NULL,
	`updated_at` timestamp NOT NULL,
	CONSTRAINT `board_columns_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `board_columns` ADD CONSTRAINT `board_columns_board_id_boards_id_fk` FOREIGN KEY (`board_id`) REFERENCES `boards`(`id`) ON DELETE cascade ON UPDATE no action;