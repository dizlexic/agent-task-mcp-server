import { getRouterParam, getQuery } from 'h3'
import { eq, and } from 'drizzle-orm'
import { db } from '../../../../db'
import { tasks, boardMembers } from '../../../../db/schema'

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event)
  const boardId = getRouterParam(event, 'id')!

  const membership = (await db.select().from(boardMembers)
    .where(and(eq(boardMembers.boardId, boardId), eq(boardMembers.userId, session.user.id))))[0]
  if (!membership) {
    throw createError({ statusCode: 403, statusMessage: 'Not a member of this board' })
  }

  const query = getQuery(event)
  const status = query.status as string | undefined

  const conditions = [eq(tasks.boardId, boardId)]
  if (status) {
    const validStatuses = ['backlog', 'todo', 'in_progress', 'review', 'done', 'archive']
    if (!validStatuses.includes(status)) {
      throw createError({ statusCode: 400, statusMessage: `Invalid status: ${status}` })
    }
    conditions.push(eq(tasks.status, status as any))
  }

  return await db.select().from(tasks).where(and(...conditions))
})
