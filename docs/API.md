# Moo Tasks API Documentation

## Auth API

### Register
`POST /api/auth/register`
- Registers a new user account.

### Login
`POST /api/auth/login`
- Logs in a user.

## Tasks API

### Create Task
`POST /api/tasks`

**Body**:
- `boardId` (string, required): The ID of the board.
- `title` (string, required): Title of the task.
- `description` (string, optional): Description of the task.
- `priority` (string, optional): One of 'low', 'medium', 'high', 'critical'. Default: 'medium'.
- `status` (string, optional): One of 'backlog', 'todo', 'in_progress', 'review', 'done', 'archive'. Default: 'backlog'.
- `order` (number, optional): Order index.
- `assignee` (string, optional): Assignee name/id.
- `parentTaskId` (string, optional): ID of a parent task.
- `difficulty` (number, optional): 1-5.

**Returns**: The created task object.

### List Tasks
`GET /api/tasks`

- Returns a list of tasks for the user.
