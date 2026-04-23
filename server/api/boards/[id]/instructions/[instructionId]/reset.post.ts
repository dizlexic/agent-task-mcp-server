import { getRouterParam } from 'h3'
import { eq, and } from 'drizzle-orm'
import { db } from '../../../../../db'
import { instructions, boardMembers } from '../../../../../db/schema'

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event)
  const boardId = getRouterParam(event, 'id')!
  const instructionId = getRouterParam(event, 'instructionId')!

  const membershipResults = await db.select().from(boardMembers)
    .where(and(eq(boardMembers.boardId, boardId), eq(boardMembers.userId, session.user.id)))
  const membership = membershipResults[0]
  if (!membership || membership.role !== 'owner') {
    throw createError({ statusCode: 403, statusMessage: 'Only the board owner can reset instructions' })
  }

  const existingResults = await db.select().from(instructions).where(eq(instructions.id, instructionId))
  const existing = existingResults[0]
  if (!existing || existing.boardId !== boardId) {
    throw createError({ statusCode: 404, statusMessage: 'Board instruction not found' })
  }

  // Delete the board-specific override so it falls back to global
  await db.delete(instructions).where(eq(instructions.id, instructionId))

  return { reset: true, type: existing.type }
})
