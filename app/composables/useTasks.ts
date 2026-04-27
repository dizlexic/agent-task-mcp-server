import type { Task } from '../../server/db/schema'

export type TaskStatus = 'backlog' | 'todo' | 'in_progress' | 'review' | 'done' | 'archive'
export type TaskPriority = 'low' | 'medium' | 'high' | 'critical'

export function useTasks(boardId: string) {
  const tasks = useState<Task[]>(`tasks-${boardId}`, () => [])
  const taskTags = useState<any[]>(`task-tags-${boardId}`, () => [])
  const loading = useState(`tasks-loading-${boardId}`, () => false)

  const { connect, getSocket } = useSocket()

  async function fetchTasks() {
    loading.value = true
    try {
      tasks.value = await $fetch<Task[]>(`/api/boards/${boardId}/tasks`)
    } finally {
      loading.value = false
    }
  }

  async function fetchTaskTags() {
    taskTags.value = await $fetch<any[]>(`/api/boards/${boardId}/task-tags`)
  }

  function tasksByStatus(status: TaskStatus): Task[] {
    return tasks.value
      .filter(t => t.status === status)
      .sort((a, b) => {
        if (a.order !== b.order) return a.order - b.order
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      })
  }

  async function createTask(data: {
    title: string
    description?: string
    priority?: TaskPriority
    status?: TaskStatus
    assignee?: string
    parentTaskId?: string
    difficulty?: number
  }) {
    const task = await $fetch<Task>(`/api/boards/${boardId}/tasks`, { method: 'POST', body: data })
    // Optimistic update — socket event will reconcile
    const exists = tasks.value.some(t => t.id === task.id)
    if (!exists) tasks.value.push(task)
    return task
  }

  async function updateTask(id: string, data: Partial<Pick<Task, 'title' | 'description' | 'status' | 'priority' | 'assignee' | 'order' | 'difficulty'>>) {
    const updated = await $fetch<Task>(`/api/tasks/${id}`, { method: 'PATCH', body: data })
    const idx = tasks.value.findIndex(t => t.id === id)
    if (idx !== -1) tasks.value[idx] = updated
    return updated
  }

  async function deleteTask(id: string) {
    await $fetch(`/api/tasks/${id}`, { method: 'DELETE' })
    tasks.value = tasks.value.filter(t => t.id !== id)
  }

  async function addComment(taskId: string, content: string) {
    return await $fetch(`/api/tasks/${taskId}/comments`, {
      method: 'POST',
      body: { content }
    })
  }

  async function fetchComments(taskId: string) {
    return await $fetch<any[]>(`/api/tasks/${taskId}/comments`)
  }

  async function moveTask(id: string, status: TaskStatus, order: number) {
    return updateTask(id, { status, order })
  }

  function startSocket() {
    if (!import.meta.client) return

    const socket = connect()
    socket.emit('join-board', boardId)

    socket.on('task:created', (task: Task) => {
      const exists = tasks.value.some(t => t.id === task.id)
      if (!exists) tasks.value.push(task)
    })

    socket.on('task:updated', (task: Task) => {
      const idx = tasks.value.findIndex(t => t.id === task.id)
      if (idx !== -1) {
        tasks.value[idx] = task
      } else {
        tasks.value.push(task)
      }
    })

    socket.on('task:deleted', (data: { id: string }) => {
      tasks.value = tasks.value.filter(t => t.id !== data.id)
    })
  }

  function stopSocket() {
    const socket = getSocket()
    if (!socket) return

    socket.emit('leave-board', boardId)
    socket.off('task:created')
    socket.off('task:updated')
    socket.off('task:deleted')
  }

  return { tasks, taskTags, loading, fetchTasks, fetchTaskTags, tasksByStatus, createTask, updateTask, deleteTask, addComment, fetchComments, moveTask, startSocket, stopSocket }
}
