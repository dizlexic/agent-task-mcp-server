import { getRouterParam } from 'h3'
import { eq, and } from 'drizzle-orm'
import { db } from '../../../../db'
import { invitations, boardMembers } from '../../../../db/schema'

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event)
  const boardId = getRouterParam(event, 'id')!
  const invitationId = getRouterParam(event, 'invitationId')!

  const myMembershipResult = await db.select().from(boardMembers)
    .where(and(eq(boardMembers.boardId, boardId), eq(boardMembers.userId, (session.user as any).id)))
  const myMembership = myMembershipResult[0]
  if (!myMembership || myMembership.role !== 'owner') {
    throw createError({ statusCode: 403, statusMessage: 'Only the board owner can manage invitations' })
  }

  await db.delete(invitations)
    .where(and(eq(invitations.id, invitationId), eq(invitations.boardId, boardId)))

  return { success: true }
})
