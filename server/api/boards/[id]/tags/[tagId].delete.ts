import { getRouterParam } from 'h3'
import { eq, and } from 'drizzle-orm'
import { db } from '../../../../db'
import { tags, boardMembers } from '../../../../db/schema'

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event)
  const boardId = getRouterParam(event, 'id')!
  const tagId = getRouterParam(event, 'tagId')!

  const membership = (await db.select().from(boardMembers)
    .where(and(eq(boardMembers.boardId, boardId), eq(boardMembers.userId, session.user.id))))[0]
  if (!membership) {
    throw createError({ statusCode: 403, statusMessage: 'Not a member of this board' })
  }

  const tag = (await db.select().from(tags).where(and(eq(tags.id, tagId), eq(tags.boardId, boardId))))[0]
  if (!tag) {
    throw createError({ statusCode: 404, statusMessage: 'Tag not found' })
  }

  await db.delete(tags).where(eq(tags.id, tagId))

  return { success: true }
})
