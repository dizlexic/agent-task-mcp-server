import { getRouterParam } from 'h3'
import { eq, and } from 'drizzle-orm'
import { db } from '../../../../db'
import { boardTransfers, boards, boardMembers, users } from '../../../../db/schema'
import { sendEmail } from '../../../../utils/mailer'

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event)
  const boardId = getRouterParam(event, 'id')!
  const user = session.user as any

  const existingTransfer = await db.select().from(boardTransfers)
    .where(and(eq(boardTransfers.boardId, boardId), eq(boardTransfers.status, 'pending'), eq(boardTransfers.recipientEmail, user.email)))
  
  if (existingTransfer.length === 0) {
    throw createError({ statusCode: 404, statusMessage: 'No pending transfer request found for you' })
  }

  const transfer = existingTransfer[0]

  // Update board owner
  await db.update(boards)
    .set({ ownerId: user.id })
    .where(eq(boards.id, boardId))

  // Update old owner role to member
  await db.update(boardMembers)
    .set({ role: 'member' })
    .where(and(eq(boardMembers.boardId, boardId), eq(boardMembers.userId, transfer.senderId)))
  
  // Check if new owner is already a member
  const newOwnerMembership = await db.select().from(boardMembers)
    .where(and(eq(boardMembers.boardId, boardId), eq(boardMembers.userId, user.id)))
  
  if (newOwnerMembership.length === 0) {
      // Add as member first
      await db.insert(boardMembers).values({
          boardId,
          userId: user.id,
          role: 'owner',
          joinedAt: new Date()
      })
  } else {
      // Update role to owner
      await db.update(boardMembers)
        .set({ role: 'owner' })
        .where(and(eq(boardMembers.boardId, boardId), eq(boardMembers.userId, user.id)))
  }
    
  // Update transfer status
  await db.update(boardTransfers)
    .set({ status: 'accepted', updatedAt: new Date() })
    .where(eq(boardTransfers.id, transfer.id))

  // Notify sender
  const sender = await db.select().from(users).where(eq(users.id, transfer.senderId))
  if (sender[0]) {
    await sendEmail(sender[0].email, `Board transfer accepted`, `Your transfer request for the board has been accepted.`)
  }

  // Notify recipient
  await sendEmail(user.email, `Board transfer accepted`, `The transfer request for the board has been accepted and you are now the owner.`)

  return { message: 'Transfer accepted' }
})
