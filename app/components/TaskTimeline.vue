<script setup lang="ts">
const props = defineProps<{ taskId: string; boardId: string }>()
const { fetchTimeline } = useTasks(props.boardId)

const events = ref<any[]>([])
const loading = ref(false)

async function loadTimeline() {
  loading.value = true
  try {
    const data = await fetchTimeline(props.taskId)
    events.value = [
      ...data.comments.map(c => ({ ...c, type: 'comment' })),
      ...data.logs.map(l => ({ ...l, type: 'log' }))
    ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  } catch (e: any) {
    console.error('Failed to load timeline:', e)
  } finally {
    loading.value = false
  }
}

function formatDate(date: string | Date) {
  return new Date(date).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

onMounted(loadTimeline)
</script>

<template>
  <div class="space-y-4 border-2 border-red-500 p-4">
    <div class="flex items-center gap-2">
      <span class="text-neon-purple" aria-hidden="true">⏳</span>
      <h3 class="text-sm font-bold uppercase tracking-widest text-gray-700 dark:text-gray-300">Timeline (Debugging: {{ events.length }} events)</h3>
    </div>

    <div v-if="loading" class="flex justify-center py-4">
      <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-neon-purple"></div>
    </div>
    <div v-else-if="events.length === 0" class="text-center py-4 text-xs text-gray-400 dark:text-gray-600 font-medium italic">
      No activity yet.
    </div>
    <div v-else class="space-y-4">
      <div v-for="event in events" :key="event.id" class="flex gap-4">
        <div class="shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-black text-white shadow-sm" :class="event.type === 'comment' ? 'bg-neon-cyan' : 'bg-neon-purple'">
          {{ event.type === 'comment' ? '💬' : '⚡' }}
        </div>
        <div class="flex-1 space-y-1">
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold text-gray-900 dark:text-white">{{ event.type === 'comment' ? event.author : event.actor }}</span>
            <span class="text-[10px] font-medium text-gray-400 dark:text-gray-600">{{ formatDate(event.createdAt) }}</span>
          </div>
          <div class="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
            {{ event.type === 'comment' ? event.content : event.action }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
