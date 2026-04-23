import { readBody, getRouterParam } from 'h3'
import { eq, and } from 'drizzle-orm'
import { db } from '../../../../db'
import { instructions, boardMembers } from '../../../../db/schema'
import { generateId } from '../../../../utils/id'

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event)
  const boardId = getRouterParam(event, 'id')!
  const instructionId = getRouterParam(event, 'instructionId')!
  const body = await readBody(event)

  const membershipResults = await db.select().from(boardMembers)
    .where(and(eq(boardMembers.boardId, boardId), eq(boardMembers.userId, session.user.id)))
  const membership = membershipResults[0]
  if (!membership || membership.role !== 'owner') {
    throw createError({ statusCode: 403, statusMessage: 'Only the board owner can edit instructions' })
  }

  if (!body?.content || typeof body.content !== 'string' || !body.content.trim()) {
    throw createError({ statusCode: 400, statusMessage: 'Content is required' })
  }

  // Check if this is a global instruction being overridden for this board
  const existingResults = await db.select().from(instructions).where(eq(instructions.id, instructionId))
  const existing = existingResults[0]
  if (!existing) {
    throw createError({ statusCode: 404, statusMessage: 'Instruction not found' })
  }

  if (existing.boardId === null) {
    // Global instruction — create a board-specific override
    const boardInstrResults = await db.select().from(instructions)
      .where(and(eq(instructions.boardId, boardId), eq(instructions.type, existing.type)))
    const boardInstr = boardInstrResults[0]

    if (boardInstr) {
      // Update existing board override
      await db.update(instructions).set({
        content: body.content.trim(),
        isDefault: false,
        updatedAt: new Date(),
        updatedBy: session.user.id,
      }).where(eq(instructions.id, boardInstr.id))
      const results = await db.select().from(instructions).where(eq(instructions.id, boardInstr.id))
      return results[0]
    } else {
      // Create new board-specific instruction
      const newId = generateId()
      await db.insert(instructions).values({
        id: newId,
        boardId,
        type: existing.type,
        content: body.content.trim(),
        isDefault: false,
        updatedAt: new Date(),
        updatedBy: session.user.id,
      })
      const results = await db.select().from(instructions).where(eq(instructions.id, newId))
      return results[0]
    }
  } else {
    // Board-specific instruction — update directly
    await db.update(instructions).set({
      content: body.content.trim(),
      isDefault: false,
      updatedAt: new Date(),
      updatedBy: session.user.id,
    }).where(eq(instructions.id, instructionId))
    const results = await db.select().from(instructions).where(eq(instructions.id, instructionId))
    return results[0]
  }
})
