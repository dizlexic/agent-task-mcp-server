import { getRouterParam } from 'h3'
import { eq, and } from 'drizzle-orm'
import { db } from '../../db'
import { boards, boardMembers } from '../../db/schema'

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event)
  const id = getRouterParam(event, 'id')!

  const boardsResult = await db.select().from(boards).where(eq(boards.id, id))
  const board = boardsResult[0]
  if (!board) {
    throw createError({ statusCode: 404, statusMessage: 'Board not found' })
  }

  const membershipResult = await db.select().from(boardMembers)
    .where(and(eq(boardMembers.boardId, id), eq(boardMembers.userId, session.user.id)))
  const membership = membershipResult[0]
  if (!membership) {
    throw createError({ statusCode: 403, statusMessage: 'Not a member of this board' })
  }

  const { mcpToken, ...boardData } = board
  return {
    ...boardData,
    role: membership.role,
    ...(membership.role === 'owner' ? { mcpToken } : {}),
  }
})
