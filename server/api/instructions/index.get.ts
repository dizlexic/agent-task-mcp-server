import { isNull } from 'drizzle-orm'
import { db } from '../../db'
import { instructions } from '../../db/schema'

export default defineEventHandler(async (event) => {
  await requireUserSession(event)

  return await db.select().from(instructions).where(isNull(instructions.boardId))
})
