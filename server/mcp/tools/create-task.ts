import { z } from 'zod'
import { db } from '../../db'
import { tasks } from '../../db/schema'
import { generateId } from '../../utils/id'
import { emitTaskEvent } from '../../utils/socket'

export default defineMcpTool({
  description: 'Create a new task on the board. WHEN TO USE: When you identify follow-up work or need to add a new task. WHEN NOT TO USE: When a task already exists (use update-task-status or accept-task instead).',
  inputSchema: {
    title: z.string().min(1).describe('Task title (required)'),
    description: z.string().optional().describe('Task description'),
    priority: z.enum(['low', 'medium', 'high', 'critical']).optional().describe('Task priority (defaults to medium)'),
  },
  handler: async ({ title, description, priority }) => {
    const now = new Date()
    const newTask = {
      id: generateId(),
      title: title.trim(),
      description: description?.trim() || '',
      status: 'backlog' as const,
      priority: priority || 'medium' as const,
      assignee: null,
      createdAt: now,
      updatedAt: now,
    }

    await db.insert(tasks).values(newTask)
    if (newTask.boardId) emitTaskEvent(newTask.boardId, 'task:created', newTask)
    return { message: 'Task created successfully', task: newTask }
  },
})
