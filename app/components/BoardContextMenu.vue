<script setup lang="ts">
import type { Board } from '../../server/db/schema'

const emit = defineEmits<{
  close: [],
  edit: [board: Board],
  delete: [board: Board]
}>()

const board = ref<Board | null>(null)
const show = ref(false)
const x = ref(0)
const y = ref(0)

function open(event: MouseEvent, b: Board) {
  board.value = b
  x.value = event.clientX
  y.value = event.clientY
  show.value = true
  document.addEventListener('click', close)
}

function close() {
  show.value = false
  board.value = null
  document.removeEventListener('click', close)
}

function onEdit() {
  if (!board.value) return
  emit('edit', board.value)
  close()
}

function onDelete() {
  if (!board.value) return
  emit('delete', board.value)
  close()
}

defineExpose({ open })
</script>

<template>
  <Teleport to="body">
    <div
      v-if="show"
      class="fixed z-[100] bg-white dark:bg-surface-card rounded-lg shadow-xl border border-gray-200 dark:border-surface-border w-48 overflow-hidden"
      :style="{ left: `${x}px`, top: `${y}px` }"
      @click.stop
    >
      <div class="py-1">
        <button @click="onEdit" class="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-surface-hover">Edit Board</button>
        <button @click="onDelete" class="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20">Delete Board</button>
      </div>
    </div>
  </Teleport>
</template>
