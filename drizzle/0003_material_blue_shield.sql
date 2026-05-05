CREATE TABLE `task_dependencies` (
	`task_id` varchar(191) NOT NULL,
	`dependency_id` varchar(191) NOT NULL,
	CONSTRAINT `task_dependencies_task_id_dependency_id_pk` PRIMARY KEY(`task_id`,`dependency_id`)
);
--> statement-breakpoint
ALTER TABLE `task_dependencies` ADD CONSTRAINT `task_dependencies_task_id_tasks_id_fk` FOREIGN KEY (`task_id`) REFERENCES `tasks`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `task_dependencies` ADD CONSTRAINT `task_dependencies_dependency_id_tasks_id_fk` FOREIGN KEY (`dependency_id`) REFERENCES `tasks`(`id`) ON DELETE cascade ON UPDATE no action;