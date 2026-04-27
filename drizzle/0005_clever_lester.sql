CREATE TABLE `tags` (
	`id` varchar(191) NOT NULL,
	`board_id` varchar(191) NOT NULL,
	`name` varchar(255) NOT NULL,
	`color` varchar(255) NOT NULL,
	`icon` varchar(255) NOT NULL,
	CONSTRAINT `tags_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `task_tags` (
	`task_id` varchar(191) NOT NULL,
	`tag_id` varchar(191) NOT NULL,
	CONSTRAINT `task_tags_task_id_tag_id_pk` PRIMARY KEY(`task_id`,`tag_id`)
);
--> statement-breakpoint
ALTER TABLE `tags` ADD CONSTRAINT `tags_board_id_boards_id_fk` FOREIGN KEY (`board_id`) REFERENCES `boards`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `task_tags` ADD CONSTRAINT `task_tags_task_id_tasks_id_fk` FOREIGN KEY (`task_id`) REFERENCES `tasks`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `task_tags` ADD CONSTRAINT `task_tags_tag_id_tags_id_fk` FOREIGN KEY (`tag_id`) REFERENCES `tags`(`id`) ON DELETE cascade ON UPDATE no action;