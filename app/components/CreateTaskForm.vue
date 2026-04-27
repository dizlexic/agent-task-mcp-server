<script setup lang="ts">
import type { TaskPriority } from '../composables/useTasks'

const props = defineProps<{ boardId: string }>()
const emit = defineEmits<{ close: [] }>()
const { createTask } = useTasks(props.boardId)

const title = ref('')
const description = ref('')
const priority = ref<TaskPriority>('medium')
const submitting = ref(false)
const error = ref('')
const modalRef = ref<HTMLElement | null>(null)

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') {
    emit('close')
  }
}

onMounted(() => {
  document.addEventListener('keydown', onKeydown)
  nextTick(() => modalRef.value?.focus())
})

onUnmounted(() => {
  document.removeEventListener('keydown', onKeydown)
})

async function onSubmit() {
  if (!title.value.trim()) return
  error.value = ''
  submitting.value = true
  try {
    await createTask({ title: title.value.trim(), description: description.value.trim(), priority: priority.value })
    title.value = ''
    description.value = ''
    priority.value = 'medium'
    emit('close')
  } catch (e: any) {
    error.value = e.data?.message || e.statusMessage || 'Failed to create task'
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div
    ref="modalRef"
    class="fixed inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4"
    role="dialog"
    aria-modal="true"
    aria-labelledby="create-task-title"
    tabindex="-1"
    @click.self="emit('close')"
  >
    <div class="modal-panel bg-white dark:bg-surface-card rounded-2xl shadow-2xl dark:shadow-[0_0_40px_rgba(0,0,0,0.5)] w-full max-w-2xl border border-gray-200 dark:border-surface-border overflow-hidden">
      <div class="p-6 pb-4 border-b border-gray-100 dark:border-surface-border/50 flex items-center justify-between">
        <h2 id="create-task-title" class="text-xl font-bold text-gray-900 dark:text-white tracking-tight">Create New Task</h2>
        <button @click="emit('close')" class="text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors text-2xl leading-none p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-surface-raised" aria-label="Close dialog">&times;</button>
      </div>

      <div class="p-6 pt-5">
        <div v-if="error" role="alert" class="bg-red-50 dark:bg-neon-red/10 text-red-600 dark:text-neon-red text-sm font-medium rounded-xl px-4 py-3 mb-6 border border-red-200 dark:border-neon-red/20 shadow-sm shadow-neon-red/5">{{ error }}</div>

        <form @submit.prevent="onSubmit" class="space-y-5">
          <div class="space-y-1.5">
            <label for="new-task-title" class="block text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 ml-1">Title *</label>
            <input id="new-task-title" v-model="title" type="text" required autofocus class="w-full border border-gray-200 dark:border-surface-border dark:bg-surface-raised dark:text-white rounded-xl px-4 py-3 text-base font-medium focus:ring-2 focus:ring-neon-cyan/30 focus:border-neon-cyan/50 outline-none transition-all placeholder:text-gray-400 dark:placeholder:text-gray-600" placeholder="What needs to be done?" />
          </div>

          <div class="space-y-1.5">
            <label for="new-task-description" class="block text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 ml-1">Description</label>
            <textarea id="new-task-description" v-model="description" rows="8" class="w-full border border-gray-200 dark:border-surface-border dark:bg-surface-raised dark:text-white rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-neon-cyan/30 focus:border-neon-cyan/50 outline-none resize-none transition-all placeholder:text-gray-400 dark:placeholder:text-gray-600" placeholder="Add some details..." />
          </div>

          <div class="space-y-1.5">
            <label for="new-task-priority" class="block text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 ml-1">Priority</label>
            <div class="relative">
              <select id="new-task-priority" v-model="priority" class="w-full appearance-none border border-gray-200 dark:border-surface-border dark:bg-surface-raised dark:text-white rounded-xl px-4 py-2.5 text-sm font-semibold focus:ring-2 focus:ring-neon-cyan/30 focus:border-neon-cyan/50 outline-none transition-all cursor-pointer">
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
              <div class="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400" aria-hidden="true">▼</div>
            </div>
          </div>

          <div class="flex justify-end gap-3 pt-4">
            <button type="button" @click="emit('close')" class="px-5 py-2.5 text-xs font-bold uppercase tracking-widest text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 transition-colors">Cancel</button>
            <button
              type="submit"
              :disabled="submitting || !title.trim()"
              class="px-8 py-2.5 text-xs font-bold uppercase tracking-widest bg-neon-cyan text-cyan-950 dark:text-gray-900 rounded-xl hover:bg-neon-cyan/90 disabled:opacity-50 transition-all shadow-lg shadow-neon-cyan/20 active:scale-95"
            >
              {{ submitting ? 'Creating...' : 'Create Task' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>
