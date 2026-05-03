<script setup lang="ts">
import type { Task } from '../../server/db/schema'
import type { TaskStatus } from '../composables/useTasks'
import { COLUMNS } from '../utils/task-constants'

import type { Tag } from '../../server/db/schema'

const props = defineProps<{ boardId: string, showArchive: boolean, searchQuery: string, tags: Tag[] }>()
const { tasks, taskTags, tasksByStatus, moveTask, archiveAllDone, fetchTaskTags } = useTasks(props.boardId)

onMounted(() => {
  fetchTaskTags()
})
const boardContainer = ref<HTMLElement | null>(null)
const contextMenu = ref<{ open: (event: MouseEvent, task: Task) => void } | null>(null)
const isDown = ref(false)
const startX = ref(0)
const scrollLeft = ref(0)

const filteredTasks = computed(() => {
  if (!props.searchQuery) return tasks.value
  const q = props.searchQuery.toLowerCase()
  return tasks.value.filter(t => t.title.toLowerCase().includes(q) || t.description?.toLowerCase().includes(q))
})

function getTasksByStatus(status: TaskStatus): Task[] {
  return filteredTasks.value
    .filter(t => t.status === status)
    .sort((a, b) => {
      if (a.order !== b.order) return a.order - b.order
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    })
}

function onMouseDown(e: MouseEvent) {
  if ((e.target as HTMLElement).closest('.kanban-column')) return
  isDown.value = true
  startX.value = e.pageX - boardContainer.value!.offsetLeft
  scrollLeft.value = boardContainer.value!.scrollLeft
}

function onMouseLeave() {
  isDown.value = false
}

function onMouseUp() {
  isDown.value = false
}

function onMouseMove(e: MouseEvent) {
  if (!isDown.value) return
  e.preventDefault()
  const x = e.pageX - boardContainer.value!.offsetLeft
  const walk = (x - startX.value) * 1
  boardContainer.value!.scrollLeft = scrollLeft.value - walk
}

watch(() => props.showArchive, (newValue) => {
  if (newValue) {
    nextTick(() => {
      if (boardContainer.value) {
        boardContainer.value.scrollTo({
          left: boardContainer.value.scrollWidth,
          behavior: 'smooth'
        })
      }
    })
  }
})

const columns = computed(() => {
  return props.showArchive ? [...COLUMNS, { title: 'Archive', status: 'archive' }] : COLUMNS
})

const emit = defineEmits<{ taskClick: [task: Task] }>()

async function onTaskMoved(taskId: string, newStatus: string, newIndex: number) {
  await moveTask(taskId, newStatus as TaskStatus, newIndex)
}

function onContextMenu(event: MouseEvent, task: Task) {
  event.preventDefault()
  contextMenu.value?.open(event, task)
}

async function onArchiveAll() {
  await archiveAllDone()
}
</script>

<template>
  <div ref="boardContainer" 
       class="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory md:snap-none cursor-grab active:cursor-grabbing"
       @mousedown="onMouseDown"
       @mouseleave="onMouseLeave"
       @mouseup="onMouseUp"
       @mousemove="onMouseMove"
  >
    <KanbanColumn
      v-for="col in columns"
      :key="col.status"
      :title="col.title"
      :status="col.status"
      :tasks="getTasksByStatus(col.status as TaskStatus)"
      :tags="tags"
      :task-tags="taskTags"
      class="snap-start kanban-column"
      @task-moved="onTaskMoved"
      @task-click="emit('taskClick', $event)"
      @contextmenu="onContextMenu"
      @archive-all="onArchiveAll"
    />
    <TaskContextMenu ref="contextMenu" :board-id="boardId" />
  </div>
</template>
