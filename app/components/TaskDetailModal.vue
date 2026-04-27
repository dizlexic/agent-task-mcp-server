<script setup lang="ts">
import type { Task } from '../../server/db/schema'
import type { TaskStatus, TaskPriority } from '../composables/useTasks'

const props = defineProps<{ task: Task; boardId: string }>()
const emit = defineEmits<{ close: []; updated: []; openTask: [task: Task] }>()
const { updateTask, deleteTask, tasks, createTask } = useTasks(props.boardId)

const title = ref(props.task.title)
const description = ref(props.task.description || '')
const priority = ref<TaskPriority>(props.task.priority as TaskPriority)
const status = ref<TaskStatus>(props.task.status as TaskStatus)
const assignee = ref(props.task.assignee || '')
const saving = ref(false)
const confirmDelete = ref(false)
const error = ref('')
const linkCopied = ref(false)
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

async function copyTaskLink() {
  const origin = window.location.origin
  const url = `${origin}/boards/${props.boardId}?taskId=${props.task.id}`
  await navigator.clipboard.writeText(url)
  linkCopied.value = true
  setTimeout(() => { linkCopied.value = false }, 2000)
}

// Correction task
const showCorrectionForm = ref(false)
const correctionTitle = ref('')
const correctionDescription = ref('')
const correctionPriority = ref<TaskPriority>('medium')
const correctionSubmitting = ref(false)

async function onSave() {
  if (!title.value.trim()) return
  error.value = ''
  saving.value = true
  try {
    await updateTask(props.task.id, {
      title: title.value.trim(),
      description: description.value.trim(),
      priority: priority.value,
      status: status.value,
      assignee: assignee.value.trim() || null,
    } as any)
    emit('updated')
    emit('close')
  } catch (e: any) {
    error.value = e.data?.message || e.statusMessage || 'Failed to save task'
  } finally {
    saving.value = false
  }
}

async function onDelete() {
  error.value = ''
  try {
    await deleteTask(props.task.id)
    emit('close')
  } catch (e: any) {
    error.value = e.data?.message || e.statusMessage || 'Failed to delete task'
    confirmDelete.value = false
  }
}

async function onCreateCorrection() {
  if (!correctionTitle.value.trim()) return
  correctionSubmitting.value = true
  try {
    const newTask = await createTask({
      title: correctionTitle.value.trim(),
      description: correctionDescription.value.trim(),
      priority: correctionPriority.value,
      parentTaskId: props.task.id,
      status: 'todo',
    })

    // Add comment linking back to original task
    try {
      const origin = window.location.origin
      const originalTaskLink = `${origin}/boards/${props.boardId}?taskId=${props.task.id}`
      await addComment(newTask.id, `Created from correction request on task: [${props.task.title}](${originalTaskLink})`)
    } catch (commentError) {
      console.error('Failed to add link comment:', commentError)
    }

    showCorrectionForm.value = false
    correctionTitle.value = ''
    correctionDescription.value = ''
    emit('updated')
  } catch (e: any) {
    error.value = e.data?.message || e.statusMessage || 'Failed to create correction task'
  } finally {
    correctionSubmitting.value = false
  }
}

const parentTaskId = computed(() => (props.task as any).parentTaskId)
const parentTask = computed(() => tasks.value.find(t => t.id === parentTaskId.value))
const corrections = computed(() => tasks.value.filter(t => (t as any).parentTaskId === props.task.id))

function openParentTask() {
  if (parentTask.value) {
    emit('openTask', parentTask.value)
  }
}
</script>

<template>
  <div
    ref="modalRef"
    class="fixed inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4 transition-all duration-300"
    role="dialog"
    aria-modal="true"
    aria-labelledby="task-detail-title"
    tabindex="-1"
    @click.self="emit('close')"
  >
    <div class="modal-panel bg-white dark:bg-surface-card rounded-2xl shadow-2xl dark:shadow-[0_0_40px_rgba(0,0,0,0.5)] w-full max-w-2xl max-h-[90vh] overflow-hidden border border-gray-200 dark:border-surface-border flex flex-col">
      <!-- Header -->
      <div class="p-6 pb-4 border-b border-gray-100 dark:border-surface-border/50 flex items-center justify-between shrink-0">
        <div class="flex items-center gap-4">
          <h2 id="task-detail-title" class="text-xl font-bold text-gray-900 dark:text-white tracking-tight">Task Details</h2>
          <button
            type="button"
            @click="copyTaskLink"
            class="text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full border border-gray-200 dark:border-surface-border bg-gray-50 dark:bg-surface-raised text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-surface-hover hover:text-neon-cyan dark:hover:text-neon-cyan transition-all flex items-center gap-1.5"
            :aria-label="linkCopied ? 'Link copied' : 'Copy task link'"
          >
            <span aria-hidden="true">{{ linkCopied ? '✓' : '🔗' }}</span>
            <span>{{ linkCopied ? 'Copied' : 'Link' }}</span>
          </button>
        </div>
        <div class="flex items-center gap-3">
          <div v-if="parentTask" @click="openParentTask" class="cursor-pointer text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full bg-neon-orange/10 text-orange-600 dark:text-neon-orange border border-neon-orange/20 hover:bg-neon-orange/20 transition-all flex items-center gap-1.5 shadow-sm shadow-neon-orange/5" title="Go to parent task">
            <span aria-hidden="true">↩</span>
            <span class="truncate max-w-[120px]">Parent: {{ parentTask.title }}</span>
          </div>
          <div v-else-if="parentTaskId" class="text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full bg-neon-orange/10 text-orange-600 dark:text-neon-orange border border-neon-orange/20">
            <span>↩ Correction</span>
          </div>
          <button @click="emit('close')" class="text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors text-2xl leading-none p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-surface-raised" aria-label="Close dialog">&times;</button>
        </div>
      </div>

      <!-- Content -->
      <div class="flex-1 overflow-y-auto p-6 space-y-6">
        <div v-if="error" role="alert" class="bg-red-50 dark:bg-neon-red/10 text-red-600 dark:text-neon-red text-sm font-medium rounded-xl px-4 py-3 border border-red-200 dark:border-neon-red/20 shadow-sm shadow-neon-red/5">{{ error }}</div>

        <form @submit.prevent="onSave" id="task-edit-form" class="space-y-6">
          <div class="space-y-1.5">
            <label for="task-title" class="block text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 ml-1">Title</label>
            <input id="task-title" v-model="title" type="text" required class="w-full border border-gray-200 dark:border-surface-border dark:bg-surface-raised dark:text-white rounded-xl px-3 py-2 text-sm font-medium focus:ring-2 focus:ring-neon-cyan/30 focus:border-neon-cyan/50 outline-none transition-all placeholder:text-gray-400 dark:placeholder:text-gray-600" placeholder="Task title..." />
          </div>

          <div class="space-y-1.5">
            <label for="task-description" class="block text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 ml-1">Description</label>
            <textarea id="task-description" v-model="description" rows="6" class="w-full border border-gray-200 dark:border-surface-border dark:bg-surface-raised dark:text-white rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-neon-cyan/30 focus:border-neon-cyan/50 outline-none resize-none transition-all leading-relaxed placeholder:text-gray-400 dark:placeholder:text-gray-600" placeholder="Describe the task in detail..." />
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div class="space-y-1.5">
              <label for="task-status" class="block text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 ml-1">Status</label>
              <div class="relative">
                <select id="task-status" v-model="status" class="w-full appearance-none border border-gray-200 dark:border-surface-border dark:bg-surface-raised dark:text-white rounded-xl px-4 py-2.5 text-sm font-semibold focus:ring-2 focus:ring-neon-cyan/30 focus:border-neon-cyan/50 outline-none transition-all cursor-pointer">
                  <option value="backlog">Backlog</option>
                  <option value="todo">To Do</option>
                  <option value="in_progress">In Progress</option>
                  <option value="review">Review</option>
                  <option value="done">Done</option>
                  <option value="archive">Archive</option>
                </select>
                <div class="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400" aria-hidden="true">▼</div>
              </div>
            </div>
            <div class="space-y-1.5">
              <label for="task-priority" class="block text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 ml-1">Priority</label>
              <div class="relative">
                <select id="task-priority" v-model="priority" class="w-full appearance-none border border-gray-200 dark:border-surface-border dark:bg-surface-raised dark:text-white rounded-xl px-4 py-2.5 text-sm font-semibold focus:ring-2 focus:ring-neon-cyan/30 focus:border-neon-cyan/50 outline-none transition-all cursor-pointer">
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
                <div class="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400" aria-hidden="true">▼</div>
              </div>
            </div>
            <div class="space-y-1.5">
              <label for="task-assignee" class="block text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 ml-1">Assignee</label>
              <div class="relative">
                <span class="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs opacity-50" aria-hidden="true">🤖</span>
                <input id="task-assignee" v-model="assignee" type="text" class="w-full border border-gray-200 dark:border-surface-border dark:bg-surface-raised dark:text-white rounded-xl pl-9 pr-4 py-2.5 text-sm font-semibold focus:ring-2 focus:ring-neon-cyan/30 focus:border-neon-cyan/50 outline-none transition-all placeholder:text-gray-400 dark:placeholder:text-gray-600" placeholder="Agent name" />
              </div>
            </div>
          </div>

          <!-- Correction Task Section -->
          <div v-if="status === 'review' || status === 'done'" class="bg-gray-50 dark:bg-surface-raised/30 rounded-2xl p-5 border border-gray-100 dark:border-surface-border/30 space-y-4">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <span class="text-neon-orange" aria-hidden="true">↩</span>
                <h3 class="text-sm font-bold uppercase tracking-widest text-gray-700 dark:text-gray-300">Corrections</h3>
              </div>
              <button
                v-if="!showCorrectionForm"
                type="button"
                @click="showCorrectionForm = true"
                class="text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-lg border border-neon-orange/30 bg-neon-orange/10 text-orange-600 dark:text-neon-orange hover:bg-neon-orange/20 transition-all shadow-sm shadow-neon-orange/5"
              >
                + Request Change
              </button>
            </div>

            <div v-if="corrections.length > 0" class="grid grid-cols-1 gap-2">
              <div
                v-for="c in corrections"
                :key="c.id"
                @click="emit('openTask', c)"
                class="flex items-center justify-between p-3 rounded-xl border border-gray-200 dark:border-surface-border bg-white dark:bg-surface-raised hover:border-neon-orange/50 dark:hover:border-neon-orange/50 cursor-pointer transition-all group"
                role="button"
                :aria-label="`Open correction: ${c.title}`"
                tabindex="0"
                @keydown.enter="emit('openTask', c)"
              >
                <div class="flex items-center gap-3 overflow-hidden">
                  <span class="text-neon-orange opacity-50 group-hover:opacity-100 transition-opacity" aria-hidden="true">↩</span>
                  <span class="text-xs font-semibold text-gray-700 dark:text-gray-200 truncate">{{ c.title }}</span>
                </div>
                <span class="text-[9px] font-bold uppercase tracking-tighter px-1.5 py-0.5 rounded bg-gray-100 dark:bg-surface-hover text-gray-500 dark:text-gray-400">{{ c.status }}</span>
              </div>
            </div>

            <div v-if="showCorrectionForm" class="bg-white dark:bg-surface-card border border-neon-orange/20 rounded-xl p-4 space-y-4 shadow-xl shadow-neon-orange/5">
              <div class="space-y-3">
                <input v-model="correctionTitle" type="text" class="w-full border border-gray-200 dark:border-surface-border dark:bg-surface-raised dark:text-white rounded-lg px-3 py-2 text-sm font-medium focus:ring-2 focus:ring-neon-orange/30 focus:border-neon-orange/50 outline-none transition-all placeholder:text-gray-400" placeholder="What needs to be fixed?" />
                <textarea v-model="correctionDescription" rows="2" class="w-full border border-gray-200 dark:border-surface-border dark:bg-surface-raised dark:text-white rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-neon-orange/30 focus:border-neon-orange/50 outline-none resize-none transition-all placeholder:text-gray-400" placeholder="Describe the corrections needed…" />
                <div class="flex items-center justify-between gap-4">
                   <select v-model="correctionPriority" class="text-xs border border-gray-200 dark:border-surface-border dark:bg-surface-raised dark:text-white rounded-lg px-3 py-1.5 outline-none font-semibold" aria-label="Correction priority">
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                  <div class="flex gap-2">
                    <button type="button" @click="showCorrectionForm = false" class="px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 transition-colors">Cancel</button>
                    <button
                      type="button"
                      @click="onCreateCorrection"
                      :disabled="correctionSubmitting || !correctionTitle.trim()"
                      class="px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest bg-neon-orange text-white dark:text-gray-900 rounded-lg hover:bg-neon-orange/90 disabled:opacity-50 transition-all shadow-md shadow-neon-orange/20"
                    >
                      {{ correctionSubmitting ? 'Creating…' : 'Create Task' }}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>

        <div class="border-t pt-6 flex items-center justify-between">
          <div>
            <button v-if="!confirmDelete" type="button" @click="confirmDelete = true" class="text-xs font-bold uppercase tracking-widest text-red-500 hover:text-red-700 dark:text-neon-red/70 dark:hover:text-neon-red transition-all">Delete Task</button>
            <div v-else class="flex items-center gap-3" role="alert">
              <span class="text-[10px] font-bold uppercase tracking-widest text-red-600 dark:text-neon-red">Confirm?</span>
              <button type="button" @click="onDelete" class="text-[10px] font-bold uppercase tracking-widest text-red-700 dark:text-neon-red hover:underline">Yes, delete</button>
              <button type="button" @click="confirmDelete = false" class="text-[10px] font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200">Cancel</button>
            </div>
          </div>
          <div class="flex gap-2">
            <button type="button" @click="emit('close')" class="px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 transition-colors" title="Cancel">Cancel</button>
            <button
              type="submit"
              form="task-edit-form"
              :disabled="saving || !title.trim()"
              class="px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest bg-neon-cyan text-cyan-950 dark:text-gray-900 rounded-lg hover:bg-neon-cyan/90 disabled:opacity-50 transition-all shadow-md shadow-neon-cyan/20 active:scale-95"
            >
              {{ saving ? 'Saving...' : 'Save' }}
            </button>
          </div>
        </div>

        <!-- Comments Section -->
        <div class="pt-6 border-t border-gray-100 dark:border-surface-border/50">
          <TaskComments :task-id="task.id" :board-id="boardId" />
        </div>
      </div>
    </div>
  </div>
</template>
