import { z } from 'zod'
import { eq } from 'drizzle-orm'
import { db } from '../../db'
import { tasks } from '../../db/schema'
import { emitTaskEvent } from '../../utils/socket'

export default defineMcpTool({
  description: 'Accept a task by assigning yourself and moving it to in_progress. WHEN TO USE: When you want to commit to working on a task. WHEN NOT TO USE: When the task is already assigned or you just want to change its status (use update-task-status instead).',
  inputSchema: {
    taskId: z.string().describe('The unique task ID'),
    agentName: z.string().min(1).describe('Your agent name/identifier'),
  },
  handler: async ({ taskId, agentName }) => {
    const existing = (await db.select().from(tasks).where(eq(tasks.id, taskId)))[0]
    if (!existing) throw createError({ statusCode: 404, message: 'Task not found' })

    if (existing.assignee && existing.status === 'in_progress') {
      throw createError({ statusCode: 409, message: `Task is already accepted by ${existing.assignee}` })
    }

    await db.update(tasks).set({
      assignee: agentName.trim(),
      status: 'in_progress',
      updatedAt: new Date(),
    }).where(eq(tasks.id, taskId))

    const updated = (await db.select().from(tasks).where(eq(tasks.id, taskId)))[0]
    if (updated?.boardId) emitTaskEvent(updated.boardId, 'task:updated', updated)
    return { message: `Task accepted by ${agentName}`, task: updated }
  },
})
