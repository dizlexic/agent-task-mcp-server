import { readBody, getRouterParam } from 'h3'
import { eq, and, ne } from 'drizzle-orm'
import { db } from '../../../../db'
import { boardTransfers, boards, boardMembers, users } from '../../../../db/schema'
import { generateId } from '../../../../utils/id'
import { sendEmail } from '../../../../utils/mailer'

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event)
  const boardId = getRouterParam(event, 'id')!
  const body = await readBody(event)

  const myMembershipResult = await db.select().from(boardMembers)
    .where(and(eq(boardMembers.boardId, boardId), eq(boardMembers.userId, (session.user as any).id)))
  const myMembership = myMembershipResult[0]

  if (!myMembership || myMembership.role !== 'owner') {
    throw createError({ statusCode: 403, statusMessage: 'Only the board owner can transfer ownership' })
  }

  if (!body?.email || typeof body.email !== 'string') {
    throw createError({ statusCode: 400, statusMessage: 'Recipient email is required' })
  }

  const recipientEmail = body.email.trim().toLowerCase()
  
  // Check if user exists
  const recipientUser = await db.select().from(users).where(eq(users.email, recipientEmail))
  if (recipientUser.length === 0) {
    throw createError({ statusCode: 404, statusMessage: 'Recipient user not found' })
  }

  // Check if already a pending transfer
  const existingTransfer = await db.select().from(boardTransfers)
    .where(and(eq(boardTransfers.boardId, boardId), eq(boardTransfers.status, 'pending')))
  
  if (existingTransfer.length > 0) {
    throw createError({ statusCode: 409, statusMessage: 'There is already a pending transfer request' })
  }

  // Ensure recipient is a member (optional, but probably good)
  // Actually, requirement says "transfer by user email". Does the user have to be a member?
  // Let's assume they might not be a member yet.

  await db.insert(boardTransfers).values({
    id: generateId(),
    boardId,
    senderId: (session.user as any).id,
    recipientEmail,
    status: 'pending',
    createdAt: new Date(),
    updatedAt: new Date()
  })

  const board = await db.select().from(boards).where(eq(boards.id, boardId))
  const boardName = board[0]?.name || 'a board'
  
  // Notify sender and recipient
  const senderEmail = (session.user as any).email
  await sendEmail(recipientEmail, `Board transfer request for ${boardName}`, `You have been asked to take ownership of the board: ${boardName}. Please accept it in the settings.`)
  await sendEmail(senderEmail, `Board transfer request sent for ${boardName}`, `You have sent a transfer request to ${recipientEmail} for the board: ${boardName}.`)

  return { message: 'Transfer request sent' }
})
