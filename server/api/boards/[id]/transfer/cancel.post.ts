import { getRouterParam } from 'h3'
import { eq, and } from 'drizzle-orm'
import { db } from '../../../../db'
import { boardTransfers, boardMembers } from '../../../../db/schema'
import { sendEmail } from '../../../../utils/mailer'

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event)
  const boardId = getRouterParam(event, 'id')!

  const myMembershipResult = await db.select().from(boardMembers)
    .where(and(eq(boardMembers.boardId, boardId), eq(boardMembers.userId, (session.user as any).id)))
  const myMembership = myMembershipResult[0]

  if (!myMembership || myMembership.role !== 'owner') {
    throw createError({ statusCode: 403, statusMessage: 'Only the board owner can cancel transfer ownership' })
  }

  const existingTransfer = await db.select().from(boardTransfers)
    .where(and(eq(boardTransfers.boardId, boardId), eq(boardTransfers.status, 'pending')))
  
  if (existingTransfer.length === 0) {
    throw createError({ statusCode: 404, statusMessage: 'No pending transfer request found' })
  }

  const transfer = existingTransfer[0]

  await db.update(boardTransfers)
    .set({ status: 'cancelled', updatedAt: new Date() })
    .where(eq(boardTransfers.id, transfer.id))

  // Notify recipient
  await sendEmail(transfer.recipientEmail, `Board transfer request cancelled`, `The transfer request for the board has been cancelled.`)
  
  // Notify sender
  await sendEmail((session.user as any).email, `Board transfer request cancelled`, `You have cancelled the transfer request for the board.`)

  return { message: 'Transfer request cancelled' }
})
