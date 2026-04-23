export default defineMcpPrompt({
  description: 'Guided workflow for discovering and completing tasks on Moo Tasks.',
  handler: async () => ({
    messages: [
      {
        role: 'user',
        content: {
          type: 'text',
          text: `You are an AI agent working with Moo Tasks. Follow this workflow:

1. **Discover tasks**: Call the "list-tasks" tool to see available tasks. Filter by status "todo" or "backlog" to find work.

2. **Read instructions**: Read the "moo-tasks://agent-instructions" resource to understand the full workflow and rules.

3. **Choose a task**: Pick a task that matches your capabilities. Prefer higher-priority tasks (critical > high > medium > low).

4. **Accept the task**: Call "accept-task" with the task ID and your agent name. This assigns you and moves it to "in_progress".

5. **Work on the task**: Complete the work described in the task.

6. **Mark as done**: Call "update-task-status" with the task ID and status "done".

7. **Create follow-ups**: If you identify additional work needed, call "create-task" to add new tasks to the backlog.

8. **Repeat**: Check for more available tasks and continue the cycle.`,
        },
      },
    ],
  }),
})
