<script setup lang="ts">
import type { Comment } from '../../server/db/schema'
import MarkdownIt from 'markdown-it'

const props = defineProps<{ taskId: string; boardId: string }>()
const { addComment, fetchComments } = useTasks(props.boardId)
const md = new MarkdownIt()

const comments = ref<Comment[]>([])
const newComment = ref('')
const loading = ref(false)
const submitting = ref(false)
const error = ref('')
const showMarkdown = ref(false)

async function loadComments() {
  loading.value = true
  try {
    comments.value = await fetchComments(props.taskId)
  } catch (e: any) {
    console.error('Failed to load comments:', e)
  } finally {
    loading.value = false
  }
}

async function onSubmit() {
  if (!newComment.value.trim() || submitting.value) return
  submitting.value = true
  error.value = ''
  try {
    const comment = await addComment(props.taskId, newComment.value.trim())
    comments.value.push(comment as Comment)
    newComment.value = ''
  } catch (e: any) {
    error.value = e.data?.message || 'Failed to add comment'
  } finally {
    submitting.value = false
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

onMounted(loadComments)
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-2">
        <span class="text-neon-cyan" aria-hidden="true">💬</span>
        <h3 class="text-sm font-bold uppercase tracking-widest text-gray-700 dark:text-gray-300">Comments</h3>
      </div>
      <button @click="showMarkdown = !showMarkdown" class="text-xs text-gray-500 hover:text-neon-cyan transition-colors">
        {{ showMarkdown ? 'View Rendered' : 'View Markdown' }}
      </button>
    </div>

    <!-- Comment List -->
    <div class="space-y-4">
      <div v-if="loading" class="flex justify-center py-4">
        <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-neon-cyan"></div>
      </div>
      <div v-else-if="comments.length === 0" class="text-center py-8 bg-gray-50 dark:bg-surface-raised/10 rounded-2xl border border-dashed border-gray-200 dark:border-surface-border/50">
        <p class="text-xs text-gray-400 dark:text-gray-500 font-medium">No comments yet. Be the first to say something!</p>
      </div>
      <div v-else class="space-y-4">
        <div v-for="comment in comments" :key="comment.id" class="group flex gap-4">
          <div class="shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-neon-cyan to-neon-purple flex items-center justify-center text-xs font-black text-white shadow-sm">
            {{ comment.author.charAt(0).toUpperCase() }}
          </div>
          <div class="flex-1 space-y-1">
            <div class="flex items-center justify-between">
              <span class="text-xs font-bold text-gray-900 dark:text-white">{{ comment.author }}</span>
              <span class="text-[10px] font-medium text-gray-400 dark:text-gray-600">{{ formatDate(comment.createdAt) }}</span>
            </div>
            <div class="bg-gray-50 dark:bg-surface-raised/40 rounded-2xl rounded-tl-none px-4 py-3 border border-gray-100 dark:border-surface-border/30">
              <p v-if="!showMarkdown" class="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">{{ comment.content }}</p>
              <div v-else class="text-sm text-gray-700 dark:text-gray-300 leading-relaxed max-w-none" v-html="md.render(comment.content)"></div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Add Comment -->
    <div class="pt-4 border-t border-gray-100 dark:border-surface-border/50">
      <form @submit.prevent="onSubmit" class="space-y-3">
        <div v-if="error" class="text-xs text-neon-red font-bold mb-2">{{ error }}</div>
        <div class="relative">
          <textarea
            v-model="newComment"
            rows="2"
            class="w-full border border-gray-200 dark:border-surface-border dark:bg-surface-raised dark:text-white rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-neon-cyan/30 focus:border-neon-cyan/50 outline-none resize-none transition-all placeholder:text-gray-400 dark:placeholder:text-gray-600 shadow-sm"
            placeholder="Write a comment..."
            @keydown.enter.ctrl.prevent="onSubmit"
            @keydown.enter.meta.prevent="onSubmit"
          />
          <div class="absolute bottom-3 right-3 flex items-center gap-2">
             <span class="text-[9px] text-gray-400 dark:text-gray-600 font-bold uppercase tracking-tighter hidden sm:inline">⌘ + Enter</span>
             <button
              type="submit"
              :disabled="submitting || !newComment.trim()"
              class="p-1.5 rounded-lg bg-neon-cyan text-cyan-950 dark:text-gray-900 hover:bg-neon-cyan/90 disabled:opacity-50 transition-all shadow-md shadow-neon-cyan/10"
              title="Post comment"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 10l7-7m0 0l7 7m-7-7v18" />
              </svg>
            </button>
          </div>
        </div>
      </form>
    </div>
  </div>
</template>
