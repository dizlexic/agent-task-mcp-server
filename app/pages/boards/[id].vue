<script setup lang="ts">
import type { Task } from '../../../server/db/schema'
import type { Board } from '../../../server/db/schema'

const route = useRoute()
const boardId = route.params.id as string

const board = ref<(Board & { role: string }) | null>(null)
const { fetchTasks, tasksByStatus, moveTask, createTask, updateTask, deleteTask, startSocket, stopSocket, tasks } = useTasks(boardId)

const showCreateForm = ref(false)
const selectedTask = ref<Task | null>(null)
const showSettings = ref(false)
const viewMode = ref<'board' | 'list'>('board')

const mcpConfigCopied = ref(false)
const mcpToken = ref<string | null>(null)
const tokenLoading = ref(false)
const showToken = ref(false)
const tokenCopied = ref(false)

async function togglePublicMcp() {
  if (!board.value || board.value.role !== 'owner') return
  const newValue = !board.value.mcpPublic
  try {
    const updated = await $fetch<Board & { role: string }>(`/api/boards/${boardId}`, {
      method: 'PATCH',
      body: { mcpPublic: newValue }
    })
    board.value.mcpPublic = updated.mcpPublic
  } catch (e: any) {
    alert(e.data?.message || 'Failed to update MCP privacy setting')
  }
}

async function copyToken() {
  if (!mcpToken.value) return
  await navigator.clipboard.writeText(mcpToken.value)
  tokenCopied.value = true
  setTimeout(() => { tokenCopied.value = false }, 2000)
}

const mcpConfig = computed(() => {
  const origin = import.meta.client ? window.location.origin : ''
  const url = mcpToken.value
    ? `${origin}/api/boards/${boardId}/mcp?token=${mcpToken.value}`
    : `${origin}/api/boards/${boardId}/mcp`

  const config = {
    mcpServers: {
      'moo-tasks': {
        type: 'streamable-http',
        url
      }
    }
  }
  return JSON.stringify(config, null, 2)
})

async function copyMcpConfig() {
  await navigator.clipboard.writeText(mcpConfig.value)
  mcpConfigCopied.value = true
  setTimeout(() => { mcpConfigCopied.value = false }, 2000)
}

async function generateToken() {
  tokenLoading.value = true
  try {
    const res = await $fetch<{ token: string }>(`/api/boards/${boardId}/token`, { method: 'POST' })
    mcpToken.value = res.token
    showToken.value = false
  } finally {
    tokenLoading.value = false
  }
}

async function revokeToken() {
  tokenLoading.value = true
  try {
    await $fetch(`/api/boards/${boardId}/token`, { method: 'DELETE' })
    mcpToken.value = null
    showToken.value = false
  } finally {
    tokenLoading.value = false
  }
}

async function loadBoard() {
  try {
    const data = await $fetch<Board & { role: string }>(`/api/boards/${boardId}`)
    board.value = data
    mcpToken.value = (data as any).mcpToken || null
  } catch {
    await navigateTo('/dashboard')
  }
}

onMounted(async () => {
  await loadBoard()
  await fetchTasks()

  const taskId = route.query.taskId || route.query.taskid || route.query.task_id
  if (taskId && typeof taskId === 'string') {
    const task = tasks.value.find(t => t.id === taskId)
    if (task) {
      selectedTask.value = task
    }
  }

  startSocket()

  if (import.meta.client) {
    const savedView = localStorage.getItem('viewMode')
    if (savedView === 'board' || savedView === 'list') {
      viewMode.value = savedView
    }
  }
})

watch(viewMode, (newMode) => {
  if (import.meta.client) {
    localStorage.setItem('viewMode', newMode)
  }
})

onUnmounted(() => stopSocket())
</script>

<template>
  <main v-if="board" class="p-6 md:p-8 max-w-[1600px] mx-auto">
    <div class="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
      <div class="space-y-1">
        <div class="flex items-center gap-3">
          <h2 class="text-2xl font-black text-gray-900 dark:text-white tracking-tight">{{ board.name }}</h2>
          <span class="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest bg-gray-100 dark:bg-surface-raised text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-surface-border">{{ board.role }}</span>
        </div>
        <p v-if="board.description" class="text-sm font-medium text-gray-500 dark:text-gray-400 max-w-2xl">{{ board.description }}</p>
      </div>
      <div class="flex items-center gap-3">
        <div class="flex bg-gray-100 dark:bg-surface-raised p-1 rounded-xl border border-gray-200 dark:border-surface-border">
          <button
            @click="viewMode = 'board'"
            class="px-4 py-2 text-[10px] font-bold uppercase tracking-widest rounded-lg transition-all"
            :class="viewMode === 'board' ? 'bg-white dark:bg-surface-card text-gray-900 dark:text-white shadow-md shadow-black/5 dark:shadow-neon-cyan/5' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'"
          >
            Board
          </button>
          <button
            @click="viewMode = 'list'"
            class="px-4 py-2 text-[10px] font-bold uppercase tracking-widest rounded-lg transition-all"
            :class="viewMode === 'list' ? 'bg-white dark:bg-surface-card text-gray-900 dark:text-white shadow-md shadow-black/5 dark:shadow-neon-cyan/5' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'"
          >
            List
          </button>
        </div>
        <button
          @click="showSettings = !showSettings"
          class="px-4 py-2.5 text-[10px] font-bold uppercase tracking-widest text-gray-600 dark:text-gray-300 bg-white dark:bg-surface-card border border-gray-200 dark:border-surface-border rounded-xl hover:bg-gray-50 dark:hover:bg-surface-raised transition-all active:scale-95 shadow-sm"
          :class="{ 'ring-2 ring-neon-cyan/30 border-neon-cyan/50': showSettings }"
        >
          ⚙️ Settings
        </button>
        <button
          @click="showCreateForm = true"
          class="px-6 py-2.5 text-[10px] font-bold uppercase tracking-widest bg-neon-cyan text-cyan-950 dark:text-gray-900 rounded-xl hover:bg-neon-cyan/90 transition-all hover:shadow-lg hover:shadow-neon-cyan/20 active:scale-95"
        >
          + New Task
        </button>
      </div>
    </div>

    <!-- Settings Panel -->
    <transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="transform -translate-y-4 opacity-0"
      enter-to-class="transform translate-y-0 opacity-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="transform translate-y-0 opacity-100"
      leave-to-class="transform -translate-y-4 opacity-0"
    >
      <div v-if="showSettings" class="mb-8 bg-white dark:bg-surface-card rounded-2xl border border-gray-200 dark:border-surface-border p-6 shadow-xl dark:shadow-[0_0_40px_rgba(0,0,0,0.3)]">
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-sm font-bold uppercase tracking-widest text-gray-900 dark:text-white">Board Settings</h3>
          <button @click="showSettings = false" class="text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors">&times;</button>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div class="space-y-6">
            <!-- MCP Privacy Setting -->
            <div v-if="board.role === 'owner'" class="bg-gray-50 dark:bg-surface-raised/30 rounded-xl p-4 border border-gray-100 dark:border-surface-border/50">
              <div class="flex items-center justify-between">
                <div>
                  <label class="text-xs font-bold uppercase tracking-widest text-gray-700 dark:text-gray-300 block mb-1">Public MCP Endpoint</label>
                  <p class="text-[10px] font-medium text-gray-500 dark:text-gray-500 leading-relaxed">Allow access to this board's MCP server without a bearer token.</p>
                </div>
                <button
                  @click="togglePublicMcp"
                  class="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none"
                  :class="board.mcpPublic ? 'bg-neon-cyan shadow-[0_0_10px_rgba(0,240,255,0.3)]' : 'bg-gray-200 dark:bg-surface-raised'"
                >
                  <span
                    class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg transition duration-200 ease-in-out"
                    :class="board.mcpPublic ? 'translate-x-5' : 'translate-x-0'"
                  />
                </button>
              </div>
            </div>

            <!-- MCP Bearer Token -->
            <div v-if="board.role === 'owner'" class="space-y-3">
              <label class="text-xs font-bold uppercase tracking-widest text-gray-700 dark:text-gray-300 block ml-1">MCP Bearer Token</label>
              <div v-if="mcpToken" class="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <div class="flex-1 flex items-center gap-3 bg-gray-50 dark:bg-surface-dark/50 border border-gray-200 dark:border-surface-border rounded-xl px-4 py-2.5">
                  <code class="flex-1 text-[11px] font-mono truncate text-gray-700 dark:text-neon-cyan/80">
                    {{ showToken ? mcpToken : '••••••••••••••••••••••••••••••••' }}
                  </code>
                  <div class="flex items-center gap-1">
                    <button
                      @click="showToken = !showToken"
                      class="p-1.5 hover:bg-gray-200 dark:hover:bg-surface-hover rounded-lg transition-colors text-xs"
                      :title="showToken ? 'Hide token' : 'Show token'"
                    >
                      {{ showToken ? '👁️' : '🙈' }}
                    </button>
                    <button
                      @click="copyToken"
                      class="p-1.5 hover:bg-gray-200 dark:hover:bg-surface-hover rounded-lg transition-colors text-xs"
                      :title="tokenCopied ? 'Copied!' : 'Copy token'"
                    >
                      {{ tokenCopied ? '✅' : '📋' }}
                    </button>
                  </div>
                </div>
                <div class="flex gap-2">
                  <button @click="generateToken" :disabled="tokenLoading" class="flex-1 sm:flex-none text-[10px] font-bold uppercase tracking-widest px-4 py-2.5 rounded-xl border border-neon-orange/20 bg-neon-orange/5 text-orange-600 dark:text-neon-orange hover:bg-neon-orange/15 transition-all disabled:opacity-50">
                    🔄 Rotate
                  </button>
                  <button @click="revokeToken" :disabled="tokenLoading" class="flex-1 sm:flex-none text-[10px] font-bold uppercase tracking-widest px-4 py-2.5 rounded-xl border border-neon-red/20 bg-neon-red/5 text-red-600 dark:text-neon-red hover:bg-neon-red/15 transition-all disabled:opacity-50">
                    🗑 Revoke
                  </button>
                </div>
              </div>
              <div v-else>
                <button @click="generateToken" :disabled="tokenLoading" class="text-[10px] font-bold uppercase tracking-widest px-5 py-2.5 rounded-xl border border-neon-cyan/20 bg-neon-cyan/5 text-cyan-600 dark:text-neon-cyan hover:bg-neon-cyan/15 transition-all disabled:opacity-50 shadow-sm shadow-neon-cyan/5">
                  🔑 Generate Token
                </button>
                <p v-if="!board.mcpPublic" class="text-[10px] font-semibold text-red-500 dark:text-neon-red/80 mt-2 ml-1">
                  The MCP endpoint is private. A token is required for access.
                </p>
              </div>
            </div>

            <BoardMembers :board-id="boardId" :is-owner="board.role === 'owner'" />
          </div>

          <div class="space-y-6">
            <!-- MCP Config Snippet -->
            <div class="space-y-3">
              <div class="flex items-center justify-between ml-1">
                <label class="text-xs font-bold uppercase tracking-widest text-gray-700 dark:text-gray-300">MCP Client Configuration</label>
                <button
                  @click="copyMcpConfig"
                  class="text-[9px] font-black uppercase tracking-tighter px-2 py-1 rounded-md transition-all shadow-sm"
                  :class="mcpConfigCopied
                    ? 'bg-neon-green text-gray-900 shadow-neon-green/20'
                    : 'bg-gray-100 dark:bg-surface-raised text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'"
                >
                  {{ mcpConfigCopied ? '✓ Copied' : '📋 Copy JSON' }}
                </button>
              </div>
              <div class="relative group">
                <pre class="bg-gray-900 dark:bg-surface-dark/80 text-neon-green text-[11px] rounded-xl p-5 overflow-x-auto select-all cursor-pointer border border-transparent dark:border-surface-border shadow-inner dark:shadow-black transition-all hover:border-neon-green/30" @click="copyMcpConfig"><code>{{ mcpConfig }}</code></pre>
                <div class="absolute inset-0 bg-neon-green/5 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity rounded-xl"></div>
              </div>
              <p class="text-[10px] font-medium text-gray-400 dark:text-gray-500 leading-relaxed ml-1">Add this to your MCP client configuration (e.g. Claude Code, Cursor, VS Code).</p>
            </div>

            <BoardInstructions :board-id="boardId" :is-owner="board.role === 'owner'" />
          </div>
        </div>
      </div>
    </transition>

    <div class="relative min-h-[60vh]">
      <KanbanBoard v-if="viewMode === 'board'" :board-id="boardId" @task-click="selectedTask = $event" />
      <TaskListView v-else :board-id="boardId" @task-click="selectedTask = $event" />
    </div>

    <transition
      enter-active-class="modal-enter-active"
      enter-from-class="modal-enter-from"
      leave-active-class="modal-leave-active"
      leave-to-class="modal-leave-to"
    >
      <CreateTaskForm v-if="showCreateForm" :board-id="boardId" @close="showCreateForm = false" />
    </transition>

    <transition
      enter-active-class="modal-enter-active"
      enter-from-class="modal-enter-from"
      leave-active-class="modal-leave-active"
      leave-to-class="modal-leave-to"
    >
      <TaskDetailModal v-if="selectedTask" :task="selectedTask" :board-id="boardId" @close="selectedTask = null" @open-task="selectedTask = $event" />
    </transition>
  </main>
</template>
