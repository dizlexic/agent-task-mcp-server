<script setup lang="ts">
import type { Task } from '../../server/db/schema'
import type { TaskStatus } from '../composables/useTasks'
import { COLUMNS } from '../utils/task-constants'

const props = defineProps<{ boardId: string, showArchive: boolean }>()
const { tasksByStatus, moveTask } = useTasks(props.boardId)

const columns = computed(() => {
  return props.showArchive ? [...COLUMNS, { title: 'Archive', status: 'archive' }] : COLUMNS
})

const emit = defineEmits<{ taskClick: [task: Task] }>()

async function onTaskMoved(taskId: string, newStatus: string, newIndex: number) {
  await moveTask(taskId, newStatus as TaskStatus, newIndex)
}
</script>

<template>
  <div class="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory md:snap-none">
    <KanbanColumn
      v-for="col in columns"
      :key="col.status"
      :title="col.title"
      :status="col.status"
      :tasks="tasksByStatus(col.status)"
      class="snap-start"
      @task-moved="onTaskMoved"
      @task-click="emit('taskClick', $event)"
    />
  </div>
</template>
