import { z } from 'zod'
import { eq } from 'drizzle-orm'
import { db } from '../../db'
import { tasks } from '../../db/schema'

export default defineMcpTool({
  description: 'Get full details of a specific task by ID. WHEN TO USE: When you need complete information about a single task. WHEN NOT TO USE: When you want to browse multiple tasks (use list-tasks instead).',
  inputSchema: {
    taskId: z.string().describe('The unique task ID'),
  },
  handler: async ({ taskId }) => {
    const task = (await db.select().from(tasks).where(eq(tasks.id, taskId)))[0]
    if (!task) throw createError({ statusCode: 404, message: 'Task not found' })
    return task
  },
})
