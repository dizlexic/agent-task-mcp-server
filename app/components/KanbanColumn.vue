<script setup lang="ts">
import draggable from 'vuedraggable'
import type { Task } from '../../server/db/schema'
import { COLUMN_COLORS } from '../utils/task-constants'

const props = defineProps<{
  title: string
  status: string
  tasks: Task[]
}>()

const emit = defineEmits<{
  taskMoved: [taskId: string, newStatus: string]
  taskClick: [task: Task]
}>()

const localTasks = computed({
  get: () => props.tasks,
  set: () => {},
})

const isDragOver = ref(false)

function onEnd(evt: any) {
  isDragOver.value = false
  if (evt.to !== evt.from || evt.newIndex !== evt.oldIndex) {
    const taskId = evt.item?.dataset?.id
    if (taskId) {
      emit('taskMoved', taskId, props.status)
    }
  }
}

const col = computed(() => (COLUMN_COLORS as any)[props.status] || COLUMN_COLORS.backlog)
</script>

<template>
  <div
    class="flex flex-col rounded-xl border-t-4 min-w-[300px] w-[300px] bg-gray-50/50 dark:bg-surface-card border border-gray-200 dark:border-surface-border shadow-sm dark:shadow-xl transition-all duration-300"
    :class="[col.border, col.glow, isDragOver ? 'ring-2 ring-neon-cyan/30 dark:ring-neon-cyan/20 bg-gray-100 dark:bg-surface-hover' : '']"
    role="region"
    :aria-label="`${title} column, ${tasks.length} tasks`"
  >
    <div class="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-surface-border/50">
      <h3
        class="text-xs font-bold uppercase tracking-widest"
        :class="col.text"
      >
        {{ title }}
      </h3>
      <span
        class="text-[10px] font-bold rounded-full px-2 py-0.5 min-w-[20px] text-center"
        :class="col.badge"
        :aria-label="`${tasks.length} tasks`"
      >
        {{ tasks.length }}
      </span>
    </div>
    <draggable
      :model-value="localTasks"
      group="tasks"
      item-key="id"
      class="flex-1 p-2 space-y-2 min-h-[120px] overflow-y-auto rounded-b-xl transition-colors"
      ghost-class="sortable-ghost"
      drag-class="sortable-drag"
      chosen-class="sortable-chosen"
      :animation="200"
      @end="onEnd"
      @dragenter="isDragOver = true"
      @dragleave="isDragOver = false"
    >
      <template #item="{ element }">
        <div :data-id="element.id">
          <TaskCard :task="element" @click="emit('taskClick', element)" />
        </div>
      </template>
      <template #footer>
        <div v-if="tasks.length === 0" class="flex flex-col items-center justify-center py-8 text-center">
          <div class="text-2xl mb-2 opacity-30" aria-hidden="true">📋</div>
          <p class="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-600">No tasks</p>
          <p class="text-[9px] text-gray-400 dark:text-gray-600 mt-0.5">Drag tasks here</p>
        </div>
      </template>
    </draggable>
  </div>
</template>
