import { readBody, getRouterParam } from 'h3'
import { eq, and } from 'drizzle-orm'
import { db } from '../../../../db'
import { tasks, boardMembers } from '../../../../db/schema'
import { generateId } from '../../../../utils/id'
import { emitTaskEvent } from '../../../../utils/socket'

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event)
  const boardId = getRouterParam(event, 'id')!

  const membership = (await db.select().from(boardMembers)
    .where(and(eq(boardMembers.boardId, boardId), eq(boardMembers.userId, session.user.id))))[0]
  if (!membership) {
    throw createError({ statusCode: 403, statusMessage: 'Not a member of this board' })
  }

  const body = await readBody(event)

  if (!body?.title || typeof body.title !== 'string' || !body.title.trim()) {
    throw createError({ statusCode: 400, statusMessage: 'Title is required' })
  }

  const validPriorities = ['low', 'medium', 'high', 'critical']
  const priority = body.priority && validPriorities.includes(body.priority) ? body.priority : 'medium'

  const validStatuses = ['backlog', 'todo', 'in_progress', 'done']
  const status = body.status && validStatuses.includes(body.status) ? body.status : 'backlog'

  const now = new Date()
  const newTask = {
    id: generateId(),
    boardId,
    title: body.title.trim(),
    description: body.description?.trim() || '',
    status,
    priority,
    assignee: body.assignee?.trim() || null,
    createdAt: now,
    updatedAt: now,
  }

  await db.insert(tasks).values(newTask)
  emitTaskEvent(boardId, 'task:created', newTask)
  return newTask
})
