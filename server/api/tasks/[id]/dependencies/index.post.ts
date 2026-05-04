import { readBody, getRouterParam } from 'h3'
import { eq, and } from 'drizzle-orm'
import { db } from '../../../../db'
import { tasks, taskDependencies, boardMembers } from '../../../../db/schema'

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event)
  const taskId = getRouterParam(event, 'id')
  const body = await readBody(event)

  if (!taskId || !body.dependencyId) {
    throw createError({ statusCode: 400, statusMessage: 'Task ID and Dependency ID required' })
  }
  
  if (taskId === body.dependencyId) {
    throw createError({ statusCode: 400, statusMessage: 'Task cannot depend on itself' })
  }

  const taskResults = await db.select().from(tasks).where(eq(tasks.id, taskId))
  const depTaskResults = await db.select().from(tasks).where(eq(tasks.id, body.dependencyId))
  
  const task = taskResults[0]
  const depTask = depTaskResults[0]
  
  if (!task || !depTask) {
     throw createError({ statusCode: 404, statusMessage: 'Task not found' })
  }
  
  if (task.boardId !== depTask.boardId) {
      throw createError({ statusCode: 400, statusMessage: 'Tasks must be on the same board' })
  }
  
  const membershipResults = await db.select().from(boardMembers)
    .where(and(eq(boardMembers.boardId, task.boardId), eq(boardMembers.userId, session.user.id)))
    
  if (!membershipResults[0]) {
    throw createError({ statusCode: 403, statusMessage: 'Not a member of this board' })
  }
  
  await db.insert(taskDependencies).values({ taskId, dependencyId: body.dependencyId })
  
  return { success: true }
})
