import { getRouterParam } from 'h3'
import { eq, and } from 'drizzle-orm'
import { db } from '../../db'
import { tasks, boardMembers } from '../../db/schema'
import { emitTaskEvent } from '../../utils/socket'

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event)
  const id = getRouterParam(event, 'id')

  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Task ID is required' })
  }

  const taskResults = await db.select().from(tasks).where(eq(tasks.id, id))
  const existing = taskResults[0]
  if (!existing) {
    throw createError({ statusCode: 404, statusMessage: 'Task not found' })
  }

  const membershipResults = await db.select().from(boardMembers)
    .where(and(eq(boardMembers.boardId, existing.boardId), eq(boardMembers.userId, session.user.id)))
  const membership = membershipResults[0]
  if (!membership) {
    throw createError({ statusCode: 403, statusMessage: 'Not a member of this board' })
  }

  await db.delete(tasks).where(eq(tasks.id, id))
  emitTaskEvent(existing.boardId, 'task:deleted', { id, boardId: existing.boardId })

  return { success: true, id }
})
