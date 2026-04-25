import 'dotenv/config'
import { db } from '../server/db'
import { tasks } from '../server/db/schema'

async function listTasks() {
  const allTasks = await db.select().from(tasks)
  console.table(allTasks)
}

listTasks()
