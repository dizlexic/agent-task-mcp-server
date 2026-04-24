import { getRouterParam } from 'h3'
import { eq, and } from 'drizzle-orm'
import { db } from '../../../db'
import { boards, tasks, boardMembers } from '../../../db/schema'

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event)
  const id = getRouterParam(event, 'id')!

  // Check board existence and membership
  const boardsResult = await db.select().from(boards).where(eq(boards.id, id))
  const board = boardsResult[0]
  if (!board) {
    throw createError({ statusCode: 404, statusMessage: 'Board not found' })
  }

  const membershipResult = await db.select().from(boardMembers)
    .where(and(eq(boardMembers.boardId, id), eq(boardMembers.userId, session.user.id)))
  if (membershipResult.length === 0) {
    throw createError({ statusCode: 403, statusMessage: 'Not a member of this board' })
  }

  // Fetch tasks
  const boardTasks = await db.select().from(tasks).where(eq(tasks.boardId, id))

  return {
    name: board.name,
    description: board.description,
    tasks: boardTasks.map(t => ({
      title: t.title,
      description: t.description,
      status: t.status,
      priority: t.priority,
      order: t.order,
      assignee: t.assignee,
      parentTaskId: t.parentTaskId,
    }))
  }
})
