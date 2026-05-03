<script setup lang="ts">
import draggable from 'vuedraggable'
import type { Task, Tag, TaskTag } from '../../server/db/schema'
import { COLUMN_COLORS } from '../utils/task-constants'

const props = defineProps<{
  title: string
  status: string
  tasks: Task[]
  tags: Tag[]
  taskTags: TaskTag[]
}>()

const emit = defineEmits<{
  taskMoved: [taskId: string, newStatus: string, newIndex: number]
  taskClick: [task: Task]
  contextmenu: [event: MouseEvent, task: Task]
  archiveAll: []
}>()

const localTasks = ref<Task[]>([...props.tasks])
watch(() => props.tasks, (newTasks) => {
  localTasks.value = [...newTasks]
})

const isDragOver = ref(false)

function onChange(evt: any) {
  isDragOver.value = false
  if (evt.added) {
    emit('taskMoved', evt.added.element.id, props.status, evt.added.newIndex)
  } else if (evt.moved) {
    emit('taskMoved', evt.moved.element.id, props.status, evt.moved.newIndex)
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
      <div class="flex items-center gap-2">
        <h3
          class="text-xs font-bold uppercase tracking-widest"
          :class="col.text"
        >
          {{ title }}
        </h3>
        <button
          v-if="status === 'done'"
          @click="emit('archiveAll')"
          class="text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full border border-gray-200 dark:border-surface-border bg-white dark:bg-surface-raised text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-surface-hover hover:text-neon-cyan dark:hover:text-neon-cyan transition-all"
        >
          Archive All
        </button>
      </div>
      <span
        class="text-[10px] font-bold rounded-full px-2 py-0.5 min-w-[20px] text-center"
        :class="col.badge"
        :aria-label="`${tasks.length} tasks`"
      >
        {{ tasks.length }}
      </span>
    </div>
    <draggable
      v-model="localTasks"
      group="tasks"
      item-key="id"
      class="flex-1 p-2 space-y-2 min-h-[120px] overflow-y-auto rounded-b-xl transition-colors"
      ghost-class="sortable-ghost"
      drag-class="sortable-drag"
      chosen-class="sortable-chosen"
      :animation="200"
      @change="onChange"
      @dragenter="isDragOver = true"
      @dragleave="isDragOver = false"
    >
      <template #item="{ element }">
        <div :data-id="element.id">
          <TaskCard 
            :task="element" 
            :tags="tags" 
            :task-tags="taskTags"
            @click="emit('taskClick', element)" 
            @contextmenu="emit('contextmenu', $event, element)" 
          />
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
