CREATE TABLE IF NOT EXISTS `board_members` (
	`board_id` varchar(191) NOT NULL,
	`user_id` varchar(191) NOT NULL,
	`role` enum('owner','member') NOT NULL DEFAULT 'member',
	`joined_at` timestamp NOT NULL,
	CONSTRAINT `board_members_board_id_user_id_pk` PRIMARY KEY(`board_id`,`user_id`)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `boards` (
	`id` varchar(191) NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`owner_id` varchar(191) NOT NULL,
	`mcp_token` text,
	`mcp_public` boolean NOT NULL DEFAULT false,
	`mcp_enabled_functions` json,
	`created_at` timestamp NOT NULL,
	`updated_at` timestamp NOT NULL,
	CONSTRAINT `boards_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `comments` (
	`id` varchar(191) NOT NULL,
	`task_id` varchar(191) NOT NULL,
	`board_id` varchar(191) NOT NULL,
	`author` varchar(255) NOT NULL,
	`content` text NOT NULL,
	`created_at` timestamp NOT NULL,
	CONSTRAINT `comments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `email_verification_tokens` (
	`id` varchar(191) NOT NULL,
	`user_id` varchar(191) NOT NULL,
	`token` varchar(191) NOT NULL,
	`expires_at` timestamp NOT NULL,
	CONSTRAINT `email_verification_tokens_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `instructions` (
	`id` varchar(191) NOT NULL,
	`board_id` varchar(191),
	`type` enum('agent_instructions','task_workflow') NOT NULL,
	`content` text NOT NULL,
	`is_default` boolean NOT NULL DEFAULT true,
	`updated_at` timestamp NOT NULL,
	`updated_by` varchar(191),
	CONSTRAINT `instructions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `invitations` (
	`id` varchar(191) NOT NULL,
	`board_id` varchar(191) NOT NULL,
	`email` varchar(191) NOT NULL,
	`inviter_id` varchar(191) NOT NULL,
	`created_at` timestamp NOT NULL,
	CONSTRAINT `invitations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `password_reset_tokens` (
	`id` varchar(191) NOT NULL,
	`user_id` varchar(191) NOT NULL,
	`token` varchar(191) NOT NULL,
	`expires_at` timestamp NOT NULL,
	CONSTRAINT `password_reset_tokens_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `tags` (
	`id` varchar(191) NOT NULL,
	`board_id` varchar(191) NOT NULL,
	`name` varchar(255) NOT NULL,
	`color` varchar(255) NOT NULL,
	`icon` varchar(255) NOT NULL,
	CONSTRAINT `tags_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `task_tags` (
	`task_id` varchar(191) NOT NULL,
	`tag_id` varchar(191) NOT NULL,
	CONSTRAINT `task_tags_task_id_tag_id_pk` PRIMARY KEY(`task_id`,`tag_id`)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `tasks` (
	`id` varchar(191) NOT NULL,
	`board_id` varchar(191) NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`status` enum('backlog','todo','in_progress','review','done','archive') NOT NULL DEFAULT 'backlog',
	`priority` enum('low','medium','high','critical') NOT NULL DEFAULT 'medium',
	`order` int NOT NULL DEFAULT 0,
	`assignee` varchar(255),
	`parent_task_id` varchar(191),
	`difficulty` int,
	`created_at` timestamp NOT NULL,
	`updated_at` timestamp NOT NULL,
	CONSTRAINT `tasks_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `users` (
	`id` varchar(191) NOT NULL,
	`email` varchar(191) NOT NULL,
	`name` varchar(255) NOT NULL,
	`password_hash` text NOT NULL,
	`is_verified` boolean NOT NULL DEFAULT false,
	`created_at` timestamp NOT NULL,
	`updated_at` timestamp NOT NULL,
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_email_unique` UNIQUE(`email`)
);
--> statement-breakpoint
ALTER TABLE `board_members` ADD CONSTRAINT `board_members_board_id_boards_id_fk` FOREIGN KEY (`board_id`) REFERENCES `boards`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `board_members` ADD CONSTRAINT `board_members_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `boards` ADD CONSTRAINT `boards_owner_id_users_id_fk` FOREIGN KEY (`owner_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `comments` ADD CONSTRAINT `comments_task_id_tasks_id_fk` FOREIGN KEY (`task_id`) REFERENCES `tasks`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `comments` ADD CONSTRAINT `comments_board_id_boards_id_fk` FOREIGN KEY (`board_id`) REFERENCES `boards`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `email_verification_tokens` ADD CONSTRAINT `email_verification_tokens_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `instructions` ADD CONSTRAINT `instructions_board_id_boards_id_fk` FOREIGN KEY (`board_id`) REFERENCES `boards`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `instructions` ADD CONSTRAINT `instructions_updated_by_users_id_fk` FOREIGN KEY (`updated_by`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `invitations` ADD CONSTRAINT `invitations_board_id_boards_id_fk` FOREIGN KEY (`board_id`) REFERENCES `boards`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `invitations` ADD CONSTRAINT `invitations_inviter_id_users_id_fk` FOREIGN KEY (`inviter_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `password_reset_tokens` ADD CONSTRAINT `password_reset_tokens_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `tags` ADD CONSTRAINT `tags_board_id_boards_id_fk` FOREIGN KEY (`board_id`) REFERENCES `boards`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `task_tags` ADD CONSTRAINT `task_tags_task_id_tasks_id_fk` FOREIGN KEY (`task_id`) REFERENCES `tasks`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `task_tags` ADD CONSTRAINT `task_tags_tag_id_tags_id_fk` FOREIGN KEY (`tag_id`) REFERENCES `tags`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `tasks` ADD CONSTRAINT `tasks_board_id_boards_id_fk` FOREIGN KEY (`board_id`) REFERENCES `boards`(`id`) ON DELETE cascade ON UPDATE no action;