import { db } from '../../db'
import { tasks } from '../../db/schema'

export default defineMcpResource({
  uri: 'moo-tasks://board-state',
  name: 'Board State',
  description: 'Full snapshot of the kanban board with all tasks grouped by status.',
  mimeType: 'application/json',
  handler: async () => {
    const allTasks = await db.select().from(tasks)

    const grouped = {
      backlog: allTasks.filter(t => t.status === 'backlog'),
      todo: allTasks.filter(t => t.status === 'todo'),
      in_progress: allTasks.filter(t => t.status === 'in_progress'),
      done: allTasks.filter(t => t.status === 'done'),
    }

    return {
      totalTasks: allTasks.length,
      columns: grouped,
    }
  },
})
