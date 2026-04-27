import { readBody, getRouterParam } from 'h3'
import { eq, and } from 'drizzle-orm'
import { db } from '../../../../db'
import { tags, boardMembers } from '../../../../db/schema'
import { generateId } from '../../../../utils/id'

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event)
  const boardId = getRouterParam(event, 'id')!
  const body = await readBody(event)

  const membership = (await db.select().from(boardMembers)
    .where(and(eq(boardMembers.boardId, boardId), eq(boardMembers.userId, session.user.id))))[0]
  if (!membership) {
    throw createError({ statusCode: 403, statusMessage: 'Not a member of this board' })
  }

  if (!body?.name || !body?.color || !body?.icon) {
    throw createError({ statusCode: 400, statusMessage: 'Name, color, and icon are required' })
  }

  const tag = {
    id: generateId(),
    boardId,
    name: body.name.trim(),
    color: body.color.trim(),
    icon: body.icon.trim(),
  }

  await db.insert(tags).values(tag)

  return tag
})
