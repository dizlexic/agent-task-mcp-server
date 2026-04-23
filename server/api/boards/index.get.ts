import { eq } from 'drizzle-orm'
import { db } from '../../db'
import { boards, boardMembers } from '../../db/schema'

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event)
  const userId = session.user.id

  const memberships = await db.select({ boardId: boardMembers.boardId })
    .from(boardMembers)
    .where(eq(boardMembers.userId, userId))

  const boardIds = memberships.map(m => m.boardId)
  if (boardIds.length === 0) return []

  const allBoards = await db.select().from(boards)
  return allBoards.filter(b => boardIds.includes(b.id))
})
