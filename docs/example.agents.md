# AGENTS.md

> Drop this file into the root of any project that uses a **Moo Tasks** board as
> its task queue. It tells AI coding agents (Junie, Claude Code, Cursor, Copilot,
> Codex, Aider, etc.) how to discover, accept, and complete work for this
> repository through the board's MCP server.

---

## 1. What is the Moo Tasks board?

Moo Tasks is a kanban board that exposes each board as its own
[Model Context Protocol](https://modelcontextprotocol.io/specification/2025-11-25)
(MCP) server. The endpoint is **scoped to a single board** — an agent connected
to one board can never see or modify tasks on any other board.

- **Endpoint URL:** `https://<your-moo-tasks-host>/api/boards/<boardId>/mcp`
- **Transport:** `streamable-http`
- **Auth:** `Authorization: Bearer <token>` (per
  [MCP basic spec](https://modelcontextprotocol.io/specification/2025-11-25/basic))

> ⚠️ Tokens via `?token=` query string are **not supported**. Always use the
> `Authorization` header.

---

## 2. Connecting your agent

On the board page, click **Show MCP Config → 📋 Copy JSON**. Paste the snippet
into your MCP client's config:

```json
{
  "mcpServers": {
    "moo-tasks": {
      "type": "streamable-http",
      "url": "https://<your-moo-tasks-host>/api/boards/<boardId>/mcp",
      "headers": {
        "Authorization": "Bearer <your-bearer-token>"
      }
    }
  }
}
```

Common locations:

| Client       | Path                            |
|--------------|---------------------------------|
| Claude Code  | `~/.claude.json` or project `.mcp.json` |
| Cursor       | `.cursor/mcp.json`              |
| VS Code      | `.vscode/mcp.json`              |
| JetBrains    | Settings → Tools → MCP Servers  |
| Junie        | Settings → MCP Servers          |

---

## 3. Available MCP tools

Once connected, the following tools are available (subject to per-board
toggles in board settings):

| Tool                  | Purpose                                               |
|-----------------------|-------------------------------------------------------|
| `list-tasks`          | Discover open tasks (filter by status/priority)       |
| `get-task`            | Read full details of a single task                    |
| `get-comments`        | Read all comments on a task                           |
| `accept-task`         | Claim a task — assigns you and sets `in_progress`     |
| `add-comment`         | Post progress notes / questions on a task             |
| `update-task-status`  | Move a task between columns                           |
| `submit-for-review`   | Mark a task ready for human review                    |
| `request-corrections` | Create a linked correction task off a reviewed task   |
| `create-task`         | File a new task on the board                          |
| `delete-task`         | Remove a task (use sparingly)                         |

Plus resources/prompts:

- Resource `moo-tasks://<boardId>/board-state` — full board snapshot
- Resource `moo-tasks://<boardId>/agent-instructions` — board-specific guidance
- Prompt `task-workflow` — guided workflow for picking up & finishing tasks

---

## 4. Recommended workflow for agents

When a human asks you to "work on the board" (or whenever you have idle
capacity on this project), follow this loop:

1. **Read instructions first.** Fetch the
   `moo-tasks://<boardId>/agent-instructions` resource and the `task-workflow`
   prompt — these may contain project-specific rules that override this file.
2. **Discover work.** Call `list-tasks` (filter `status=todo`, sort by priority)
   to find unclaimed tasks.
3. **Pick one task.** Prefer `critical` > `high` > `medium` > `low`. Read the
   full task with `get-task` and any prior `get-comments`.
4. **Accept it.** Call `accept-task` with a stable `agentName` (e.g. your
   model + handle, like `"junie"` or `"claude-code"`). This locks the task to
   you and moves it to `in_progress`.
5. **Work in this repository.** Make the code changes the task describes,
   following the project's existing conventions, tests, and lint rules.
6. **Communicate.** Use `add-comment` for non-trivial decisions, blockers,
   or questions. Comments are visible to humans on the board in real time.
7. **Submit for review.** When done, call `submit-for-review` with the task ID.
   Do **not** mark tasks `done` yourself — humans (or a reviewer agent) move
   tasks from `review` to `done` after verifying.
8. **Handle corrections.** If a human creates a correction task linked to your
   original (parent) task, treat it as a new top-priority item: accept it,
   address the feedback, and submit it for review.

### Rules of thumb

- ✅ Always `accept-task` **before** writing code, so humans see who's working.
- ✅ One task at a time per agent identity.
- ✅ If a task is unclear, leave a comment asking for clarification rather than
  guessing — and leave the task in `todo` (don't accept it yet).
- ❌ Don't `delete-task` unless explicitly told to.
- ❌ Don't move tasks straight to `done` — always go through `review`.
- ❌ Don't try to access tasks from other boards; this token only works for
  the single board it was issued for.

---

## 5. Security notes for humans

- Treat the bearer token like a password. Anyone with it can act as an agent
  on your board.
- Rotate tokens from the board settings drawer if a token leaks; revocation
  is instant.
- Prefer per-agent or per-environment tokens if your deployment supports it.
- Public boards (`mcpPublic = true`) skip auth entirely and should only be
  used for read-only demos.
