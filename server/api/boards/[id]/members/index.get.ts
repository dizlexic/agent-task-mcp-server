import { getRouterParam } from 'h3'
import { eq, and } from 'drizzle-orm'
import { db } from '../../../../db'
import { boardMembers, users, invitations } from '../../../../db/schema'

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event)
  const boardId = getRouterParam(event, 'id')!

  const myMembershipResult = await db.select().from(boardMembers)
    .where(and(eq(boardMembers.boardId, boardId), eq(boardMembers.userId, (session.user as any).id)))
  const myMembership = myMembershipResult[0]
  if (!myMembership) {
    throw createError({ statusCode: 403, statusMessage: 'Not a member of this board' })
  }

  const members = await db.select({
    userId: boardMembers.userId,
    role: boardMembers.role,
    joinedAt: boardMembers.joinedAt,
    name: users.name,
    email: users.email,
  })
    .from(boardMembers)
    .innerJoin(users, eq(boardMembers.userId, users.id))
    .where(eq(boardMembers.boardId, boardId))

  const pendingInvites = await db.select({
    id: invitations.id,
    email: invitations.email,
    createdAt: invitations.createdAt,
  })
    .from(invitations)
    .where(eq(invitations.boardId, boardId))

  return {
    members,
    invitations: pendingInvites
  }
})
