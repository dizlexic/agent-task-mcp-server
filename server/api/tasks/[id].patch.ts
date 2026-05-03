import { readBody, getRouterParam } from 'h3'
import { eq, and } from 'drizzle-orm'
import { db } from '../../db'
import { tasks, boardMembers } from '../../db/schema'
import { emitTaskEvent } from '../../utils/socket'
import { reindexTasks, reorderTasks } from '../../utils/tasks'
import { logBoardEvent } from '../../utils/logs'

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event)
  const id = getRouterParam(event, 'id')

  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Task ID is required' })
  }

  const existingResults = await db.select().from(tasks).where(eq(tasks.id, id))
  const existing = existingResults[0]
  if (!existing) {
    throw createError({ statusCode: 404, statusMessage: 'Task not found' })
  }

  const membershipResults = await db.select().from(boardMembers)
    .where(and(eq(boardMembers.boardId, existing.boardId), eq(boardMembers.userId, session.user.id)))
  const membership = membershipResults[0]
  if (!membership) {
    throw createError({ statusCode: 403, statusMessage: 'Not a member of this board' })
  }

  const body = await readBody(event)
  const updates: Record<string, any> = { updatedAt: new Date() }

  if (body.title !== undefined) {
    if (typeof body.title !== 'string' || !body.title.trim()) {
      throw createError({ statusCode: 400, statusMessage: 'Title cannot be empty' })
    }
    updates.title = body.title.trim()
  }

  if (body.description !== undefined) {
    updates.description = typeof body.description === 'string' ? body.description.trim() : ''
  }

  if (body.status !== undefined) {
    const validStatuses = ['backlog', 'todo', 'in_progress', 'review', 'done', 'archive']
    if (!validStatuses.includes(body.status)) {
      throw createError({ statusCode: 400, statusMessage: `Invalid status: ${body.status}` })
    }
    updates.status = body.status
  }

  if (body.priority !== undefined) {
    const validPriorities = ['low', 'medium', 'high', 'critical']
    if (!validPriorities.includes(body.priority)) {
      throw createError({ statusCode: 400, statusMessage: `Invalid priority: ${body.priority}` })
    }
    updates.priority = body.priority
  }

  if (body.assignee !== undefined) {
    updates.assignee = body.assignee ? String(body.assignee).trim() : null
  }

  if (body.parentTaskId !== undefined) {
    updates.parentTaskId = body.parentTaskId ? String(body.parentTaskId).trim() : null
  }

  if (body.order !== undefined) {
    updates.order = parseInt(body.order, 10)
  }

  if (body.difficulty !== undefined) {
    if (body.difficulty === null) {
      updates.difficulty = null
    } else {
      const difficulty = parseInt(body.difficulty, 10)
      if (isNaN(difficulty) || difficulty < 1 || difficulty > 5) {
        throw createError({ statusCode: 400, statusMessage: 'Difficulty must be between 1 and 5' })
      }
      updates.difficulty = difficulty
    }
  }

  await db.update(tasks).set(updates).where(eq(tasks.id, id))
  await logBoardEvent({
    boardId: existing.boardId,
    type: 'user_action',
    actor: session.user.name || session.user.email,
    action: 'task:updated',
    data: { taskId: id, updates: body }
  })

  const finalResults = await db.select().from(tasks).where(eq(tasks.id, id))
  const result = finalResults[0]

  if (result) {
    console.log('Task updated:', result.id, 'oldStatus:', existing.status, 'newStatus:', result.status, 'order:', result.order)
    if (existing.status !== result.status) {
      await reindexTasks(result.boardId, existing.status)
      await reorderTasks(result.boardId, result.status, result.id, result.order)
    } else if (body.order !== undefined) {
      await reorderTasks(result.boardId, result.status, result.id, result.order)
    } else {
      await reindexTasks(result.boardId, result.status)
    }
    emitTaskEvent(result.boardId, 'task:updated', result)
  }
  return result
})
