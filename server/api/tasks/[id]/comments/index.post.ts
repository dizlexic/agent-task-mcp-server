import { getRouterParam, readBody } from 'h3'
import { eq, and } from 'drizzle-orm'
import { db } from '../../../../db'
import { tasks, comments, boardMembers } from '../../../../db/schema'
import { generateId } from '../../../../utils/id'
import { logBoardEvent } from '../../../../utils/logs'

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event)
  const taskId = getRouterParam(event, 'id')

  if (!taskId) {
    throw createError({ statusCode: 400, statusMessage: 'Task ID is required' })
  }

  const body = await readBody(event)
  if (!body?.content?.trim()) {
    throw createError({ statusCode: 400, statusMessage: 'Comment content is required' })
  }

  const taskResults = await db.select().from(tasks).where(eq(tasks.id, taskId))
  const task = taskResults[0]
  if (!task) {
    throw createError({ statusCode: 404, statusMessage: 'Task not found' })
  }

  const membershipResults = await db.select().from(boardMembers)
    .where(and(eq(boardMembers.boardId, task.boardId), eq(boardMembers.userId, session.user.id)))
  const membership = membershipResults[0]
  if (!membership) {
    throw createError({ statusCode: 403, statusMessage: 'Not a member of this board' })
  }

  const newComment = {
    id: generateId(),
    taskId,
    boardId: task.boardId,
    author: session.user.name || session.user.email,
    content: body.content.trim(),
    createdAt: new Date(),
  }

  await db.insert(comments).values(newComment)
  await logBoardEvent({
    boardId: task.boardId,
    type: 'user_action',
    actor: session.user.name || session.user.email,
    action: 'comment:added',
    data: { taskId, commentId: newComment.id }
  })
  return newComment
})
