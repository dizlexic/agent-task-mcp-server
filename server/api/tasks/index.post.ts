import { readBody } from 'h3'
import { eq, and } from 'drizzle-orm'
import { db } from '../../db'
import { tasks, boardMembers } from '../../db/schema'
import { generateId } from '../../utils/id'
import { reorderTasks } from '../../utils/tasks'
import { emitTaskEvent } from '../../utils/socket'

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event)
  const body = await readBody(event)

  if (!body?.boardId || typeof body.boardId !== 'string') {
    throw createError({ statusCode: 400, statusMessage: 'boardId is required' })
  }

  const membershipResult = await db.select().from(boardMembers)
    .where(and(eq(boardMembers.boardId, body.boardId), eq(boardMembers.userId, session.user.id)))
  const membership = membershipResult[0]
  if (!membership) {
    throw createError({ statusCode: 403, statusMessage: 'Not a member of this board' })
  }

  if (!body?.title || typeof body.title !== 'string' || !body.title.trim()) {
    throw createError({ statusCode: 400, statusMessage: 'Title is required' })
  }

  const validPriorities = ['low', 'medium', 'high', 'critical']
  const priority = body.priority && validPriorities.includes(body.priority) ? body.priority : 'medium'

  const validStatuses = ['backlog', 'todo', 'in_progress', 'review', 'done']
  const status = body.status && validStatuses.includes(body.status) ? body.status : 'backlog'

  const now = new Date()
  const newTask = {
    id: generateId(),
    boardId: body.boardId,
    title: body.title.trim(),
    description: body.description?.trim() || '',
    status,
    priority,
    order: body.order !== undefined ? parseInt(body.order, 10) : 0,
    assignee: body.assignee?.trim() || null,
    parentTaskId: body.parentTaskId?.trim() || null,
    createdAt: now,
    updatedAt: now,
  }

  await db.insert(tasks).values(newTask)
  await reorderTasks(body.boardId, status, newTask.id, newTask.order)
  emitTaskEvent(body.boardId, 'task:created', newTask)

  return newTask
})
