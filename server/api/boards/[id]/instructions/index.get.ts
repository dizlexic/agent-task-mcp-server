import { getRouterParam } from 'h3'
import { eq, and, isNull } from 'drizzle-orm'
import { db } from '../../../../db'
import { instructions, boardMembers } from '../../../../db/schema'

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event)
  const boardId = getRouterParam(event, 'id')!

  const membershipResults = await db.select().from(boardMembers)
    .where(and(eq(boardMembers.boardId, boardId), eq(boardMembers.userId, session.user.id)))
  const membership = membershipResults[0]
  if (!membership) {
    throw createError({ statusCode: 403, statusMessage: 'Not a member of this board' })
  }

  // Get board-specific instructions
  const boardInstructions = await db.select().from(instructions)
    .where(eq(instructions.boardId, boardId))

  // Get global instructions as fallback
  const globalInstructions = await db.select().from(instructions)
    .where(isNull(instructions.boardId))

  // For each type, return board-specific if exists, otherwise global
  const types = ['agent_instructions', 'task_workflow']
  return types.map(type => {
    const boardInstr = boardInstructions.find(i => i.type === type)
    if (boardInstr) return { ...boardInstr, source: 'board' }
    const globalInstr = globalInstructions.find(i => i.type === type)
    if (globalInstr) return { ...globalInstr, source: 'global' }
    return null
  }).filter(Boolean)
})
