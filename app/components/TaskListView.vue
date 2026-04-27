<script setup lang="ts">
import type { Task } from '../../server/db/schema'
import { COLUMNS, COLUMN_COLORS } from '../utils/task-constants'

const props = defineProps<{ boardId: string, showArchive: boolean }>()
const { tasksByStatus } = useTasks(props.boardId)

const columns = computed(() => {
  return props.showArchive ? [...COLUMNS, { title: 'Archive', status: 'archive' }] : COLUMNS
})

const emit = defineEmits<{ taskClick: [task: Task] }>()

const collapsed = ref<Record<string, boolean>>({})

function toggleCollapse(status: string) {
  collapsed.value[status] = !isCollapsed(status)
}

function isCollapsed(status: string) {
  return collapsed.value[status] ?? true
}
</script>

<template>
  <div class="space-y-4">
    <div
      v-for="col in columns"
      :key="col.status"
      class="bg-white dark:bg-surface-card rounded-2xl border border-gray-100 dark:border-surface-border/50 overflow-hidden shadow-sm transition-all"
    >
      <button
        @click="toggleCollapse(col.status)"
        class="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 dark:hover:bg-surface-raised transition-all group"
      >
        <div class="flex items-center gap-4">
          <span
            class="text-[10px] font-black rounded-full px-2.5 py-1 min-w-[2rem] text-center uppercase tracking-tighter"
            :class="COLUMN_COLORS[col.status].badge"
          >
            {{ tasksByStatus(col.status).length }}
          </span>
          <h3 class="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-widest">{{ col.title }}</h3>
        </div>
        <div class="text-gray-400 group-hover:text-neon-cyan transition-colors">
          <div
            class="transition-transform duration-300"
            :class="{ 'rotate-180': !isCollapsed(col.status) }"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </button>

      <transition
        enter-active-class="transition duration-300 ease-out"
        enter-from-class="transform -translate-y-2 opacity-0"
        enter-to-class="transform translate-y-0 opacity-100"
      >
        <div v-if="!isCollapsed(col.status)" class="p-5 pt-0">
          <div v-if="tasksByStatus(col.status).length === 0" class="text-center py-8 text-xs font-medium text-gray-400 dark:text-gray-500 italic bg-gray-50/50 dark:bg-surface-dark/30 rounded-xl border border-dashed border-gray-200 dark:border-surface-border/50">
            No tasks in this category
          </div>
          <div
            v-else
            class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            <div
              v-for="task in tasksByStatus(col.status)"
              :key="task.id"
              class="cursor-pointer"
              @click="emit('taskClick', task)"
            >
              <TaskCard :task="task" />
            </div>
          </div>
        </div>
      </transition>
    </div>
  </div>
</template>
