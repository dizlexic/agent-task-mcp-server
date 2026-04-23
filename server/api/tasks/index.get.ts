import { getQuery } from 'h3'
import { eq, and } from 'drizzle-orm'
import { db } from '../../db'
import { tasks, boardMembers } from '../../db/schema'

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event)
  const query = getQuery(event)
  const status = query.status as string | undefined

  // Get all boards the user is a member of
  const memberships = await db.select({ boardId: boardMembers.boardId })
    .from(boardMembers)
    .where(eq(boardMembers.userId, session.user.id))

  const boardIds = memberships.map(m => m.boardId)
  if (boardIds.length === 0) return []

  let allTasks = await db.select().from(tasks)
  allTasks = allTasks.filter(t => boardIds.includes(t.boardId))

  if (status) {
    const validStatuses = ['backlog', 'todo', 'in_progress', 'done']
    if (!validStatuses.includes(status)) {
      throw createError({ statusCode: 400, statusMessage: `Invalid status: ${status}` })
    }
    allTasks = allTasks.filter(t => t.status === status)
  }

  return allTasks
})
