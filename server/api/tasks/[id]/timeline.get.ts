import { getRouterParam } from 'h3'
import { eq, and } from 'drizzle-orm'
import { db } from '../../../db'
import { tasks, comments, boardLogs, boardMembers } from '../../../db/schema'

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event)
  const taskId = getRouterParam(event, 'id')

  if (!taskId) {
    throw createError({ statusCode: 400, statusMessage: 'Task ID is required' })
  }

  const taskResults = await db.select().from(tasks).where(eq(tasks.id, taskId))
  const task = taskResults[0]
  if (!task) {
    throw createError({ statusCode: 404, statusMessage: 'Task not found' })
  }

  const membershipResults = await db.select().from(boardMembers)
    .where(and(eq(boardMembers.boardId, task.boardId), eq(boardMembers.userId, session.user.id)))
  const membership = membershipResults[0]
  if (!membership) {
    throw createError({ statusCode: 403, statusMessage: 'Not a member of this board' })
  }

  const taskComments = await db.select().from(comments).where(eq(comments.taskId, taskId))
  const logs = await db.select().from(boardLogs).where(eq(boardLogs.boardId, task.boardId))
  
  // Filter logs for this task
  const taskLogs = logs.filter(log => log.data && (log.data as any).taskId === taskId)

  return {
    comments: taskComments,
    logs: taskLogs
  }
})
