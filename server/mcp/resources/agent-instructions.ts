export default defineMcpResource({
  uri: 'moo-tasks://agent-instructions',
  name: 'Agent Instructions',
  description: 'Workflow instructions for AI agents interacting with Moo Tasks.',
  mimeType: 'text/plain',
  handler: async () => {
    return `# Moo Tasks — Agent Workflow Instructions

## Overview
You are interacting with a kanban-style task board. Tasks flow through four columns:
Backlog → To Do → In Progress → Done

## Task Statuses
- **backlog**: Tasks that have been identified but not yet prioritized
- **todo**: Tasks ready to be worked on
- **in_progress**: Tasks currently being worked on by an agent
- **done**: Completed tasks

## Task Priorities
- **critical**: Must be addressed immediately
- **high**: Important, should be done soon
- **medium**: Normal priority (default)
- **low**: Nice to have, can wait

## Workflow
1. Use **list-tasks** to discover available tasks (filter by status "todo" or "backlog")
2. Use **accept-task** with your agent name to claim a task (moves it to in_progress)
3. Work on the task
4. Use **update-task-status** to mark the task as "done" when complete
5. If you discover follow-up work, use **create-task** to add new tasks

## Rules
- Always accept a task before working on it
- Only work on one task at a time when possible
- Set appropriate priority when creating new tasks
- Provide clear, descriptive titles for new tasks
- Mark tasks as done promptly when finished`
  },
})
