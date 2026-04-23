import { readBody, getRouterParam } from 'h3'
import { eq, and } from 'drizzle-orm'
import { db } from '../../../../db'
import { boardMembers, users, invitations } from '../../../../db/schema'
import { generateId } from '../../../../utils/id'

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event)
  const boardId = getRouterParam(event, 'id')!
  const body = await readBody(event)

  const myMembershipResult = await db.select().from(boardMembers)
    .where(and(eq(boardMembers.boardId, boardId), eq(boardMembers.userId, (session.user as any).id)))
  const myMembership = myMembershipResult[0]

  if (!myMembership) {
    throw createError({ statusCode: 403, statusMessage: 'You are not a member of this board' })
  }

  if (myMembership.role !== 'owner') {
    throw createError({ statusCode: 403, statusMessage: 'Only the board owner can invite members' })
  }

  if (!body?.email || typeof body.email !== 'string') {
    throw createError({ statusCode: 400, statusMessage: 'Email is required' })
  }

  const email = body.email.trim().toLowerCase()
  const inviteeResults = await db.select().from(users).where(eq(users.email, email))
  const invitee = inviteeResults[0]

  if (invitee) {
    const existingResults = await db.select().from(boardMembers)
      .where(and(eq(boardMembers.boardId, boardId), eq(boardMembers.userId, invitee.id)))
    const existing = existingResults[0]
    if (existing) {
      throw createError({ statusCode: 409, statusMessage: 'User is already a member of this board' })
    }
  }

  // Check if already invited
  const existingInviteResults = await db.select().from(invitations)
    .where(and(eq(invitations.boardId, boardId), eq(invitations.email, email)))
  const existingInvite = existingInviteResults[0]

  if (existingInvite) {
    throw createError({ statusCode: 409, statusMessage: 'This email has already been invited' })
  }

  await db.insert(invitations).values({
    id: generateId(),
    boardId,
    email,
    inviterId: (session.user as any).id,
    createdAt: new Date()
  })

  return { email, invited: true, message: 'Invitation sent' }
})
