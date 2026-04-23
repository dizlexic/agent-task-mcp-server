import { getRouterParam } from 'h3'
import { eq, and } from 'drizzle-orm'
import { db } from '../../db'
import { tasks, boardMembers } from '../../db/schema'

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event)
  const id = getRouterParam(event, 'id')

  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Task ID is required' })
  }

  const taskResults = await db.select().from(tasks).where(eq(tasks.id, id))
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

  return task
})
