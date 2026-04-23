import { eq } from 'drizzle-orm'
import { db } from '../../db'
import { invitations, boards } from '../../db/schema'

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event)
  const userId = (session.user as any).id

  return await db.select({
    id: invitations.id,
    boardId: invitations.boardId,
    boardName: boards.name,
    email: invitations.email,
    createdAt: invitations.createdAt,
  })
  .from(invitations)
  .innerJoin(boards, eq(invitations.boardId, boards.id))
  .where(eq(invitations.inviterId, userId))
})
