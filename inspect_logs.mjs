
import { db } from './server/db/index.js'
import { boardLogs } from './server/db/schema.js'

async function inspectLogs() {
  const logs = await db.select().from(boardLogs).limit(10)
  console.log(JSON.stringify(logs, null, 2))
  process.exit(0)
}

inspectLogs()
