import { readBody, getRouterParam } from 'h3'
import { eq, and } from 'drizzle-orm'
import { db } from '../../../../../../db'
import { taskTags, tasks, tags, boardMembers } from '../../../../../../db/schema'

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event)
  const boardId = getRouterParam(event, 'id')!
  const taskId = getRouterParam(event, 'taskId')!
  const body = await readBody(event)

  const membership = (await db.select().from(boardMembers)
    .where(and(eq(boardMembers.boardId, boardId), eq(boardMembers.userId, session.user.id))))[0]
  if (!membership) {
    throw createError({ statusCode: 403, statusMessage: 'Not a member of this board' })
  }

  const task = (await db.select().from(tasks).where(and(eq(tasks.id, taskId), eq(tasks.boardId, boardId))))[0]
  if (!task) {
    throw createError({ statusCode: 404, statusMessage: 'Task not found' })
  }

  if (!body?.tagId) {
    throw createError({ statusCode: 400, statusMessage: 'tagId is required' })
  }

  const tag = (await db.select().from(tags).where(and(eq(tags.id, body.tagId), eq(tags.boardId, boardId))))[0]
  if (!tag) {
    throw createError({ statusCode: 404, statusMessage: 'Tag not found' })
  }

  await db.insert(taskTags).values({
    taskId,
    tagId: body.tagId,
  })

  return { success: true }
})
