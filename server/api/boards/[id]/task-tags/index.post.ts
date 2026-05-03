import { readBody, getRouterParam } from 'h3'
import { eq, and } from 'drizzle-orm'
import { db } from '../../../../db'
import { taskTags, boardMembers } from '../../../../db/schema'

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event)
  const boardId = getRouterParam(event, 'id')!

  const membership = (await db.select().from(boardMembers)
    .where(and(eq(boardMembers.boardId, boardId), eq(boardMembers.userId, session.user.id))))[0]
  if (!membership) {
    throw createError({ statusCode: 403, statusMessage: 'Not a member of this board' })
  }

  const body = await readBody(event)
  const { taskId, tagId } = body

  if (!taskId || !tagId) {
    throw createError({ statusCode: 400, statusMessage: 'taskId and tagId are required' })
  }

  // Check if link already exists
  const existing = (await db.select().from(taskTags)
    .where(and(eq(taskTags.taskId, taskId), eq(taskTags.tagId, tagId))))[0]
  
  if (existing) {
    return existing
  }

  const newLink = {
    taskId,
    tagId,
  }

  await db.insert(taskTags).values(newLink)
  return newLink
})
