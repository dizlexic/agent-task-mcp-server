import { getRouterParam } from 'h3'
import { eq, and } from 'drizzle-orm'
import { db } from '../../../db'
import { invitations } from '../../../db/schema'

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event)
  const invitationId = getRouterParam(event, 'id')!
  const userEmail = (session.user as any).email

  const results = await db.select().from(invitations)
    .where(and(eq(invitations.id, invitationId), eq(invitations.email, userEmail)))
  const invitation = results[0]

  if (!invitation) {
    throw createError({ statusCode: 404, statusMessage: 'Invitation not found' })
  }

  // Remove the invitation
  await db.delete(invitations).where(eq(invitations.id, invitationId))

  return { success: true }
})
