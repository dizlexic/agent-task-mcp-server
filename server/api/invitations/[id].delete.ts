import { getRouterParam } from 'h3'
import { eq, and } from 'drizzle-orm'
import { db } from '../../db'
import { invitations, boardMembers } from '../../db/schema'

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event)
  const userId = (session.user as any).id
  const invitationId = getRouterParam(event, 'id')!

  // Find the invitation
  const invitation = (await db.select().from(invitations).where(eq(invitations.id, invitationId)))[0]
  if (!invitation) {
    throw createError({ statusCode: 404, statusMessage: 'Invitation not found' })
  }

  // Check if user is the inviter
  const isInviter = invitation.inviterId === userId

  // Check if user is the board owner
  const myMembership = (await db.select().from(boardMembers)
    .where(and(eq(boardMembers.boardId, invitation.boardId), eq(boardMembers.userId, userId))))[0]
  const isOwner = myMembership?.role === 'owner'

  if (!isInviter && !isOwner) {
    throw createError({ statusCode: 403, statusMessage: 'You are not authorized to cancel this invitation' })
  }

  await db.delete(invitations)
    .where(eq(invitations.id, invitationId))

  return { success: true }
})
