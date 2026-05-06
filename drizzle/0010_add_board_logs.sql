CREATE TABLE IF NOT EXISTS `board_logs` (
	`id` varchar(191) NOT NULL,
	`board_id` varchar(191) NOT NULL,
	`type` enum('agent_connection','mcp_request','user_connection','user_action') NOT NULL,
	`actor` varchar(255) NOT NULL,
	`action` varchar(255) NOT NULL,
	`data` json,
	`created_at` timestamp NOT NULL,
	CONSTRAINT `board_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
DROP PROCEDURE IF EXISTS AddConstraintIfNotExists;--> statement-breakpoint
CREATE PROCEDURE AddConstraintIfNotExists(
	IN tableName VARCHAR(255),
	IN constraintName VARCHAR(255),
	IN constraintDef TEXT
)
BEGIN
	DECLARE count INT;
	SELECT COUNT(*) INTO count
	FROM information_schema.TABLE_CONSTRAINTS
	WHERE TABLE_SCHEMA = DATABASE()
	AND TABLE_NAME = tableName
	AND CONSTRAINT_NAME = constraintName;

	IF count = 0 THEN
		SET @sqlStmt = CONCAT('ALTER TABLE `', tableName, '` ADD CONSTRAINT `', constraintName, '` ', constraintDef);
		PREPARE stmt FROM @sqlStmt;
		EXECUTE stmt;
		DEALLOCATE PREPARE stmt;
	END IF;
END;--> statement-breakpoint
CALL AddConstraintIfNotExists('board_logs', 'board_logs_board_id_boards_id_fk', 'FOREIGN KEY (`board_id`) REFERENCES `boards`(`id`) ON DELETE cascade ON UPDATE no action');--> statement-breakpoint
DROP PROCEDURE IF EXISTS AddConstraintIfNotExists;