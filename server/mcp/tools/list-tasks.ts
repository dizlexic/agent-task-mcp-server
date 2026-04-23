import { z } from 'zod'
import { eq, and } from 'drizzle-orm'
import { db } from '../../db'
import { tasks } from '../../db/schema'

export default defineMcpTool({
  description: 'List tasks on the board. WHEN TO USE: To discover available tasks, check board status, or find tasks by status/priority. WHEN NOT TO USE: When you need details of a specific task (use get-task instead).',
  inputSchema: {
    status: z.enum(['backlog', 'todo', 'in_progress', 'done']).optional().describe('Filter by task status'),
    priority: z.enum(['low', 'medium', 'high', 'critical']).optional().describe('Filter by task priority'),
  },
  handler: async ({ status, priority }) => {
    const conditions = []
    if (status) conditions.push(eq(tasks.status, status))
    if (priority) conditions.push(eq(tasks.priority, priority))

    const result = conditions.length > 0
      ? await db.select().from(tasks).where(and(...conditions))
      : await db.select().from(tasks)

    return { tasks: result, count: result.length }
  },
})
