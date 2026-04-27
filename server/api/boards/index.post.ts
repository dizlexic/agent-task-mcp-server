import { readBody } from 'h3'
import { db } from '../../db'
import { boards, boardMembers, tags } from '../../db/schema'
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
    mcpToken: null,
    mcpEnabledFunctions: null,
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

  await db.insert(tags).values([
    { id: generateId(), boardId: board.id, name: 'Bug', color: '#ff4d4f', icon: 'bug' },
    { id: generateId(), boardId: board.id, name: 'Feature', color: '#52c41a', icon: 'star' },
    { id: generateId(), boardId: board.id, name: 'Improvement', color: '#1890ff', icon: 'zap' },
    { id: generateId(), boardId: board.id, name: 'Documentation', color: '#faad14', icon: 'book' },
    { id: generateId(), boardId: board.id, name: 'Question', color: '#722ed1', icon: 'help' },
  ])

  return board
})
