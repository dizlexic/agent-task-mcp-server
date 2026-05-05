import { db } from './index'
import { tasks, boards, users } from './schema'
import { nanoid } from 'nanoid'

const sampleTasks = [
  { title: 'Set up CI/CD pipeline', description: 'Configure GitHub Actions for automated testing and deployment.', status: 'backlog' as const, priority: 'medium' as const },
  { title: 'Write API documentation', description: 'Document all REST endpoints with request/response examples.', status: 'todo' as const, priority: 'high' as const },
  { title: 'Add input validation', description: 'Add Zod validation to all API route inputs.', status: 'todo' as const, priority: 'medium' as const },
  { title: 'Implement dark mode', description: 'Add dark mode toggle with Tailwind CSS dark variant.', status: 'backlog' as const, priority: 'low' as const },
  { title: 'Fix task card overflow', description: 'Long task titles overflow the card boundary on mobile.', status: 'in_progress' as const, priority: 'high' as const, assignee: 'claude' },
  { title: 'Initial project setup', description: 'Scaffold Nuxt app with Tailwind CSS and SQLite.', status: 'done' as const, priority: 'critical' as const },
]

async function seed() {
  const now = new Date()
  console.log('Seeding board and tasks...')

  await db.insert(users).values({
    id: 'seed-user-id',
    email: 'test@example.com',
    name: 'Test User',
    passwordHash: 'not-a-real-hash',
    createdAt: now,
    updatedAt: now,
  }).catch(() => console.log('User already exists or error inserting user'));

  await db.insert(boards).values({
    id: 'seed-board-id',
    name: 'Sample Board',
    description: 'A board for testing',
    ownerId: 'seed-user-id',
    createdAt: now,
    updatedAt: now,
  }).catch(() => console.log('Board already exists or error inserting board'));

  for (const task of sampleTasks) {
    await db.insert(tasks).values({
      id: nanoid(12),
      boardId: 'seed-board-id',
      title: task.title,
      description: task.description,
      status: task.status,
      priority: task.priority,
      assignee: task.assignee || null,
      createdAt: now,
      updatedAt: now,
    })
  }

  console.log(`Seeded ${sampleTasks.length} sample tasks.`)
  process.exit(0)
}

seed().catch((err) => {
  console.error('Seed failed:', err)
  process.exit(1)
})
