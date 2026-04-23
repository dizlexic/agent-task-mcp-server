import { z } from 'zod'
import { eq } from 'drizzle-orm'
import { db } from '../../db'
import { tasks } from '../../db/schema'
import { emitTaskEvent } from '../../utils/socket'

export default defineMcpTool({
  description: 'Update the status of a task. WHEN TO USE: When you need to move a task between columns (e.g., mark as done). WHEN NOT TO USE: When accepting a task for the first time (use accept-task instead).',
  inputSchema: {
    taskId: z.string().describe('The unique task ID'),
    status: z.enum(['backlog', 'todo', 'in_progress', 'done']).describe('The new status'),
  },
  handler: async ({ taskId, status }) => {
    const existing = (await db.select().from(tasks).where(eq(tasks.id, taskId)))[0]
    if (!existing) throw createError({ statusCode: 404, message: 'Task not found' })

    await db.update(tasks).set({ status, updatedAt: new Date() }).where(eq(tasks.id, taskId))

    const updated = (await db.select().from(tasks).where(eq(tasks.id, taskId)))[0]
    if (updated?.boardId) emitTaskEvent(updated.boardId, 'task:updated', updated)
    return { message: `Task status updated to ${status}`, task: updated }
  },
})
