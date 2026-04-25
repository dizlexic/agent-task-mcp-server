import { db } from '../../../server/db'
import { tasks } from '../../../server/db/schema'

export default defineEventHandler(async (event) => {
  return await db.select().from(tasks)
})
