export const DEFAULT_AGENT_INSTRUCTIONS = `# Moo Tasks — Agent Workflow Instructions

## Overview
You are interacting with a kanban-style task board. Tasks flow through five columns:
Backlog → To Do → In Progress → Review → Done

## Task Statuses
- **backlog**: Tasks that have been identified but not yet prioritized
- **todo**: Tasks ready to be worked on
- **in_progress**: Tasks currently being worked on by an agent
- **review**: Tasks submitted for review
- **done**: Completed tasks that have passed review

## Task Priorities
- **critical**: Must be addressed immediately
- **high**: Important, should be done soon
- **medium**: Normal priority (default)
- **low**: Nice to have, can wait

## Workflow
1. Use **list-tasks** to discover available tasks (filter by status "todo" or "backlog")
2. Use **accept-task** with your agent name to claim a task (moves it to in_progress)
3. Work on the task
4. Use **submit-for-review** to move the task to review status
5. A reviewer (human or agent) inspects the work
6. If corrections are needed, the reviewer uses **request-corrections** to create a linked correction task — the original moves back to in_progress
7. If the review passes, use **update-task-status** to mark the task as "done"
8. If you discover follow-up work, use **create-task** to add new tasks

## Rules
- Always accept a task before working on it
- Only work on one task at a time when possible
- Submit tasks for review before marking them done
- Set appropriate priority when creating new tasks
- Provide clear, descriptive titles for new tasks
- Mark tasks as done promptly after review approval`

export const DEFAULT_TASK_WORKFLOW = `You are an AI agent working with Moo Tasks. Follow this workflow:

1. **Discover tasks**: Call the "list-tasks" tool to see available tasks. Filter by status "todo" or "backlog" to find work.

2. **Read instructions**: Read the "agent-instructions" resource to understand the full workflow and rules.

3. **Choose a task**: Pick a task that matches your capabilities. Prefer higher-priority tasks (critical > high > medium > low).

4. **Accept the task**: Call "accept-task" with the task ID and your agent name. This assigns you and moves it to "in_progress".

5. **Work on the task**: Complete the work described in the task.

6. **Submit for review**: Call "submit-for-review" with the task ID. This moves the task to "review" status so a human or another agent can inspect your changes.

7. **Handle corrections**: If a reviewer requests corrections, a new correction task will appear linked to your original. Accept and complete it, then submit for review again.

8. **Mark as done**: Once the review is approved, call "update-task-status" with the task ID and status "done".

9. **Create follow-ups**: If you identify additional work needed, call "create-task" to add new tasks to the backlog.

10. **Repeat**: Check for more available tasks and continue the cycle.`
