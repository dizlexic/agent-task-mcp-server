import { getRouterParam } from 'h3'
import { eq, and } from 'drizzle-orm'
import { db } from '../../../db'
import { invitations, boardMembers, users } from '../../../db/schema'

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event)
  const invitationId = getRouterParam(event, 'id')!
  const userEmail = (session.user as any).email
  const userId = (session.user as any).id

  const invitationResults = await db.select().from(invitations)
    .where(and(eq(invitations.id, invitationId), eq(invitations.email, userEmail)))
  const invitation = invitationResults[0]

  if (!invitation) {
    throw createError({ statusCode: 404, statusMessage: 'Invitation not found' })
  }

  // Double check if already a member
  const existingResults = await db.select().from(boardMembers)
    .where(and(eq(boardMembers.boardId, invitation.boardId), eq(boardMembers.userId, userId)))
  const existing = existingResults[0]

  if (!existing) {
    await db.insert(boardMembers).values({
      boardId: invitation.boardId,
      userId,
      role: 'member',
      joinedAt: new Date(),
    })
  }

  // Remove the invitation
  await db.delete(invitations).where(eq(invitations.id, invitationId))

  return { success: true }
})
