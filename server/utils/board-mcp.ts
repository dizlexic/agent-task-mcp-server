import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { z } from 'zod'
import { eq, and, isNull } from 'drizzle-orm'
import { db } from '../db'
import { tasks, comments, instructions } from '../db/schema'
import { generateId } from './id'
import { emitTaskEvent } from './socket'

async function getInstructionContent(boardId: string, type: 'agent_instructions' | 'task_workflow'): Promise<string> {
  // Try board-specific first, then fall back to global
  const boardInstrResults = await db.select().from(instructions)
    .where(and(eq(instructions.boardId, boardId), eq(instructions.type, type)))
  const boardInstr = boardInstrResults[0]
  if (boardInstr) return boardInstr.content

  const globalInstrResults = await db.select().from(instructions)
    .where(and(isNull(instructions.boardId), eq(instructions.type, type)))
  const globalInstr = globalInstrResults[0]
  return globalInstr?.content || ''
}

export function createBoardMcpServer(boardId: string): McpServer {
  const server = new McpServer({
    name: `moo-tasks-${boardId}`,
    version: '2.0.0',
  })

  server.tool(
    'list-tasks',
    'List tasks on this board. WHEN TO USE: To discover available tasks, check board status, or find tasks by status/priority.',
    {
      status: z.enum(['backlog', 'todo', 'in_progress', 'review', 'done']).optional().describe('Filter by task status'),
      priority: z.enum(['low', 'medium', 'high', 'critical']).optional().describe('Filter by task priority'),
    },
    async ({ status, priority }) => {
      const conditions = [eq(tasks.boardId, boardId)]
      if (status) conditions.push(eq(tasks.status, status))
      if (priority) conditions.push(eq(tasks.priority, priority))

      const result = await db.select().from(tasks).where(and(...conditions))
      return { content: [{ type: 'text', text: JSON.stringify({ tasks: result, count: result.length }) }] }
    },
  )

  server.tool(
    'get-task',
    'Get full details of a task by ID.',
    { taskId: z.string().describe('The unique task ID') },
    async ({ taskId }) => {
      const taskResults = await db.select().from(tasks).where(and(eq(tasks.id, taskId), eq(tasks.boardId, boardId)))
      const task = taskResults[0]
      if (!task) return { content: [{ type: 'text', text: JSON.stringify({ error: 'Task not found' }) }], isError: true }
      return { content: [{ type: 'text', text: JSON.stringify(task) }] }
    },
  )

  server.tool(
    'create-task',
    'Create a new task on this board.',
    {
      title: z.string().min(1).describe('Task title'),
      description: z.string().optional().describe('Task description'),
      priority: z.enum(['low', 'medium', 'high', 'critical']).optional().describe('Task priority'),
      parentTaskId: z.string().optional().describe('Parent task ID if this is a correction/follow-up task'),
    },
    async ({ title, description, priority, parentTaskId }) => {
      const now = new Date()
      const newTask = {
        id: generateId(),
        boardId,
        title: title.trim(),
        description: description?.trim() || '',
        status: 'backlog' as const,
        priority: priority || ('medium' as const),
        assignee: null,
        parentTaskId: parentTaskId?.trim() || null,
        createdAt: now,
        updatedAt: now,
      }
      await db.insert(tasks).values(newTask)
      emitTaskEvent(boardId, 'task:created', newTask)
      return { content: [{ type: 'text', text: JSON.stringify({ message: 'Task created', task: newTask }) }] }
    },
  )

  server.tool(
    'update-task-status',
    'Update a task\'s status.',
    {
      taskId: z.string().describe('The unique task ID'),
      status: z.enum(['backlog', 'todo', 'in_progress', 'review', 'done']).describe('New status'),
    },
    async ({ taskId, status }) => {
      const existingResults = await db.select().from(tasks).where(and(eq(tasks.id, taskId), eq(tasks.boardId, boardId)))
      const existing = existingResults[0]
      if (!existing) return { content: [{ type: 'text', text: JSON.stringify({ error: 'Task not found' }) }], isError: true }

      await db.update(tasks).set({ status, updatedAt: new Date() }).where(eq(tasks.id, taskId))
      const updatedResults = await db.select().from(tasks).where(eq(tasks.id, taskId))
      const updated = updatedResults[0]
      if (updated) emitTaskEvent(boardId, 'task:updated', updated)
      return { content: [{ type: 'text', text: JSON.stringify({ message: `Task status updated to ${status}`, task: updated }) }] }
    },
  )

  server.tool(
    'submit-for-review',
    'Submit a task for review. Moves the task to review status.',
    {
      taskId: z.string().describe('The unique task ID'),
    },
    async ({ taskId }) => {
      const existingResults = await db.select().from(tasks).where(and(eq(tasks.id, taskId), eq(tasks.boardId, boardId)))
      const existing = existingResults[0]
      if (!existing) return { content: [{ type: 'text', text: JSON.stringify({ error: 'Task not found' }) }], isError: true }

      await db.update(tasks).set({ status: 'review', updatedAt: new Date() }).where(eq(tasks.id, taskId))
      const updatedResults = await db.select().from(tasks).where(eq(tasks.id, taskId))
      const updated = updatedResults[0]
      if (updated) emitTaskEvent(boardId, 'task:updated', updated)
      return { content: [{ type: 'text', text: JSON.stringify({ message: 'Task submitted for review', task: updated }) }] }
    },
  )

  server.tool(
    'request-corrections',
    'Create a correction task linked to a reviewed task. The original task stays in review.',
    {
      taskId: z.string().describe('The original task ID that needs corrections'),
      title: z.string().min(1).describe('Title for the correction task'),
      description: z.string().optional().describe('Description of corrections needed'),
      priority: z.enum(['low', 'medium', 'high', 'critical']).optional().describe('Priority for the correction task'),
    },
    async ({ taskId, title, description, priority }) => {
      const existingResults = await db.select().from(tasks).where(and(eq(tasks.id, taskId), eq(tasks.boardId, boardId)))
      const existing = existingResults[0]
      if (!existing) return { content: [{ type: 'text', text: JSON.stringify({ error: 'Original task not found' }) }], isError: true }

      const now = new Date()
      const correctionTask = {
        id: generateId(),
        boardId,
        title: title.trim(),
        description: description?.trim() || '',
        status: 'todo' as const,
        priority: priority || existing.priority || ('medium' as const),
        assignee: null,
        parentTaskId: taskId,
        createdAt: now,
        updatedAt: now,
      }
      await db.insert(tasks).values(correctionTask)
      emitTaskEvent(boardId, 'task:created', correctionTask)

      // Move original task back to in_progress
      await db.update(tasks).set({ status: 'in_progress', updatedAt: now }).where(eq(tasks.id, taskId))
      const updatedOriginalResults = await db.select().from(tasks).where(eq(tasks.id, taskId))
      const updatedOriginal = updatedOriginalResults[0]
      if (updatedOriginal) emitTaskEvent(boardId, 'task:updated', updatedOriginal)

      return { content: [{ type: 'text', text: JSON.stringify({ message: 'Correction task created, original moved back to in_progress', correctionTask, originalTaskId: taskId }) }] }
    },
  )

  server.tool(
    'accept-task',
    'Accept a task by assigning yourself and moving it to in_progress.',
    {
      taskId: z.string().describe('The unique task ID'),
      agentName: z.string().min(1).describe('Your agent name/identifier'),
    },
    async ({ taskId, agentName }) => {
      const existingResults = await db.select().from(tasks).where(and(eq(tasks.id, taskId), eq(tasks.boardId, boardId)))
      const existing = existingResults[0]
      if (!existing) return { content: [{ type: 'text', text: JSON.stringify({ error: 'Task not found' }) }], isError: true }

      if (existing.assignee && existing.status === 'in_progress') {
        return { content: [{ type: 'text', text: JSON.stringify({ error: `Task is already accepted by ${existing.assignee}` }) }], isError: true }
      }

      await db.update(tasks).set({ assignee: agentName.trim(), status: 'in_progress', updatedAt: new Date() }).where(eq(tasks.id, taskId))
      const updatedResults = await db.select().from(tasks).where(eq(tasks.id, taskId))
      const updated = updatedResults[0]
      if (updated) emitTaskEvent(boardId, 'task:updated', updated)
      return { content: [{ type: 'text', text: JSON.stringify({ message: `Task accepted by ${agentName}`, task: updated }) }] }
    },
  )

  server.tool(
    'add-comment',
    'Add a comment to a task.',
    {
      taskId: z.string().describe('The unique task ID'),
      author: z.string().min(1).describe('Name of the comment author'),
      content: z.string().min(1).describe('The comment text'),
    },
    async ({ taskId, author, content }) => {
      const taskResults = await db.select().from(tasks).where(and(eq(tasks.id, taskId), eq(tasks.boardId, boardId)))
      const task = taskResults[0]
      if (!task) return { content: [{ type: 'text', text: JSON.stringify({ error: 'Task not found' }) }], isError: true }

      const newComment = {
        id: generateId(),
        taskId,
        boardId,
        author: author.trim(),
        content: content.trim(),
        createdAt: new Date(),
      }
      await db.insert(comments).values(newComment)
      return { content: [{ type: 'text', text: JSON.stringify({ message: 'Comment added', comment: newComment }) }] }
    },
  )

  server.tool(
    'get-comments',
    'Get all comments for a task.',
    {
      taskId: z.string().describe('The unique task ID'),
    },
    async ({ taskId }) => {
      const taskResults = await db.select().from(tasks).where(and(eq(tasks.id, taskId), eq(tasks.boardId, boardId)))
      const task = taskResults[0]
      if (!task) return { content: [{ type: 'text', text: JSON.stringify({ error: 'Task not found' }) }], isError: true }

      const result = await db.select().from(comments).where(eq(comments.taskId, taskId))
      return { content: [{ type: 'text', text: JSON.stringify({ comments: result, count: result.length }) }] }
    },
  )

  server.resource(
    'board-state',
    `moo-tasks://${boardId}/board-state`,
    { description: 'Full snapshot of this board with all tasks grouped by status.', mimeType: 'application/json' },
    async () => {
      const allTasks = await db.select().from(tasks).where(eq(tasks.boardId, boardId))
      const grouped = {
        backlog: allTasks.filter(t => t.status === 'backlog'),
        todo: allTasks.filter(t => t.status === 'todo'),
        in_progress: allTasks.filter(t => t.status === 'in_progress'),
        review: allTasks.filter(t => t.status === 'review'),
        done: allTasks.filter(t => t.status === 'done'),
      }
      return { contents: [{ uri: `moo-tasks://${boardId}/board-state`, mimeType: 'application/json', text: JSON.stringify({ totalTasks: allTasks.length, columns: grouped }) }] }
    },
  )

  server.resource(
    'agent-instructions',
    `moo-tasks://${boardId}/agent-instructions`,
    { description: 'Workflow instructions for AI agents interacting with this board.', mimeType: 'text/plain' },
    async () => {
      const content = await getInstructionContent(boardId, 'agent_instructions')
      return { contents: [{ uri: `moo-tasks://${boardId}/agent-instructions`, mimeType: 'text/plain', text: content }] }
    },
  )

  server.prompt(
    'task-workflow',
    'Guided workflow for discovering and completing tasks on this board.',
    async () => {
      const content = await getInstructionContent(boardId, 'task_workflow')
      return { messages: [{ role: 'user', content: { type: 'text', text: content } }] }
    },
  )

  return server
}
