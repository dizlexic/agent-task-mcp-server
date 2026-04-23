import { eq, and } from 'drizzle-orm'
import { db } from '../../db'
import { invitations, boards, users } from '../../db/schema'

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event)
  const userEmail = (session.user as any).email

  return await db.select({
    id: invitations.id,
    boardId: invitations.boardId,
    boardName: boards.name,
    inviterName: users.name,
    createdAt: invitations.createdAt,
  })
  .from(invitations)
  .innerJoin(boards, eq(invitations.boardId, boards.id))
  .innerJoin(users, eq(invitations.inviterId, users.id))
  .where(eq(invitations.email, userEmail))
})
