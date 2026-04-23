<script setup lang="ts">
import type { Task } from '../../server/db/schema'

const props = defineProps<{ task: Task }>()
const emit = defineEmits<{ click: [task: Task] }>()

const priorityColors: Record<string, string> = {
  critical: 'bg-neon-red/10 text-red-600 dark:text-neon-red border border-neon-red/20',
  high: 'bg-neon-orange/10 text-orange-600 dark:text-neon-orange border border-neon-orange/20',
  medium: 'bg-neon-yellow/10 text-yellow-600 dark:text-neon-yellow border border-neon-yellow/20',
  low: 'bg-neon-green/10 text-green-600 dark:text-neon-green border border-neon-green/20',
}

const priorityBorder: Record<string, string> = {
  critical: 'priority-border-critical',
  high: 'priority-border-high',
  medium: 'priority-border-medium',
  low: 'priority-border-low',
}

</script>

<template>
  <div
    class="bg-white dark:bg-surface-raised rounded-xl shadow-sm dark:shadow-md dark:shadow-black/20 border border-gray-200 dark:border-surface-border p-3.5 cursor-pointer hover:shadow-md dark:hover:shadow-lg dark:hover:shadow-neon-cyan/10 hover:-translate-y-0.5 hover:border-gray-300 dark:hover:border-neon-cyan/30 transition-all duration-200 group"
    :class="priorityBorder[task.priority] || priorityBorder.medium"
    role="button"
    :aria-label="`Task: ${task.title}, Priority: ${task.priority}${task.assignee ? ', Assigned to: ' + task.assignee : ''}`"
    tabindex="0"
    @click="emit('click', task)"
    @keydown.enter="emit('click', task)"
  >
    <div class="flex items-start justify-between gap-3 mb-1.5">
      <h4 class="text-sm font-semibold text-gray-800 dark:text-gray-100 leading-snug group-hover:text-black dark:group-hover:text-white transition-colors">{{ task.title }}</h4>
      <span
        class="shrink-0 text-[9px] font-bold px-1.5 py-0.5 rounded-md uppercase tracking-wider"
        :class="priorityColors[task.priority] || priorityColors.medium"
      >
        {{ task.priority }}
      </span>
    </div>
    <p v-if="task.description" class="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mb-3 leading-relaxed">
      {{ task.description }}
    </p>
    <div class="flex items-center justify-between gap-2 mt-auto">
      <div v-if="task.assignee" class="flex items-center gap-1.5 text-[10px] font-medium text-gray-400 dark:text-gray-500">
        <span class="opacity-70 text-xs" aria-hidden="true">🤖</span>
        <span class="truncate max-w-[100px]">{{ task.assignee }}</span>
      </div>
      <div v-else></div>
      <span v-if="(task as any).parentTaskId" class="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-neon-orange/10 text-orange-600 dark:text-neon-orange border border-neon-orange/20 uppercase tracking-tight">Correction</span>
    </div>
  </div>
</template>
