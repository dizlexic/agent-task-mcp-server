import { db } from '../db'
import { sql } from 'drizzle-orm'
import { instructions } from '../db/schema'
import { generateId } from '../utils/id'
import { DEFAULT_AGENT_INSTRUCTIONS, DEFAULT_TASK_WORKFLOW } from '../db/defaults'

export default defineNitroPlugin(async () => {
  try {
    await db.execute(sql`CREATE TABLE IF NOT EXISTS users (
      id varchar(191) PRIMARY KEY NOT NULL,
      email varchar(191) NOT NULL UNIQUE,
      name varchar(255) NOT NULL,
      password_hash text NOT NULL,
      created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )`)

    await db.execute(sql`CREATE TABLE IF NOT EXISTS boards (
      id varchar(191) PRIMARY KEY NOT NULL,
      name varchar(255) NOT NULL,
      description text,
      owner_id varchar(191) NOT NULL,
      mcp_token text,
      mcp_public boolean DEFAULT false NOT NULL,
      created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )`)

    await db.execute(sql`CREATE TABLE IF NOT EXISTS board_members (
      board_id varchar(191) NOT NULL,
      user_id varchar(191) NOT NULL,
      role varchar(50) DEFAULT 'member' NOT NULL,
      joined_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (board_id, user_id)
    )`)

    await db.execute(sql`CREATE TABLE IF NOT EXISTS tasks (
      id varchar(191) PRIMARY KEY NOT NULL,
      board_id varchar(191) NOT NULL,
      title varchar(255) NOT NULL,
      description text,
      status varchar(50) DEFAULT 'backlog' NOT NULL,
      priority varchar(50) DEFAULT 'medium' NOT NULL,
      assignee varchar(255),
      parent_task_id varchar(191),
      created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )`)

    await db.execute(sql`CREATE TABLE IF NOT EXISTS instructions (
      id varchar(191) PRIMARY KEY NOT NULL,
      board_id varchar(191),
      type varchar(50) NOT NULL,
      content text NOT NULL,
      is_default boolean DEFAULT true NOT NULL,
      updated_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      updated_by varchar(191)
    )`)

    await db.execute(sql`CREATE TABLE IF NOT EXISTS comments (
      id varchar(191) PRIMARY KEY NOT NULL,
      task_id varchar(191) NOT NULL,
      board_id varchar(191) NOT NULL,
      author varchar(255) NOT NULL,
      content text NOT NULL,
      created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`)

    await db.execute(sql`CREATE TABLE IF NOT EXISTS invitations (
      id varchar(191) PRIMARY KEY NOT NULL,
      board_id varchar(191) NOT NULL,
      email varchar(191) NOT NULL,
      inviter_id varchar(191) NOT NULL,
      created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(board_id, email)
    )`)

    // Seed default global instructions if none exist
    const existing = await db.select().from(instructions)
    if (existing.length === 0) {
      const now = new Date()
      await db.insert(instructions).values([
        {
          id: generateId(),
          boardId: null,
          type: 'agent_instructions',
          content: DEFAULT_AGENT_INSTRUCTIONS,
          isDefault: true,
          updatedAt: now,
          updatedBy: null,
        },
        {
          id: generateId(),
          boardId: null,
          type: 'task_workflow',
          content: DEFAULT_TASK_WORKFLOW,
          isDefault: true,
          updatedAt: now,
          updatedBy: null,
        },
      ])
    }
  } catch (err) {
    console.error('Database migration failed:', err)
  }
})
