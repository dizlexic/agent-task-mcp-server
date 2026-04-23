import { readBody } from 'h3'
import { db } from '../../db'
import { boards, boardMembers } from '../../db/schema'
import { generateId } from '../../utils/id'

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event)
  const body = await readBody(event)

  if (!body?.name || typeof body.name !== 'string' || !body.name.trim()) {
    throw createError({ statusCode: 400, statusMessage: 'Board name is required' })
  }

  const now = new Date()
  const board = {
    id: generateId(),
    name: body.name.trim(),
    description: body.description?.trim() || '',
    ownerId: session.user.id,
    createdAt: now,
    updatedAt: now,
  }

  await db.insert(boards).values(board)
  await db.insert(boardMembers).values({
    boardId: board.id,
    userId: session.user.id,
    role: 'owner',
    joinedAt: now,
  })

  return board
})
