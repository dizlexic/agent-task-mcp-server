<template>
  <div class="flex flex-wrap gap-2">
    <button
      v-for="tag in availableTags"
      :key="tag.id"
      type="button"
      @click="toggleTag(tag.id)"
      class="px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1 transition-all"
      :class="isSelected(tag.id) ? 'ring-2 ring-offset-2 ring-neon-cyan dark:ring-offset-surface-card' : 'opacity-70 hover:opacity-100'"
      :style="{ backgroundColor: tag.color, color: 'white' }"
    >
      <span>{{ getIcon(tag.icon) }}</span>
      <span>{{ tag.name }}</span>
    </button>
    <button
      type="button"
      @click="showCreateTagModal = true"
      class="px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1 opacity-50 hover:opacity-100 border border-dashed border-gray-400 dark:border-gray-600"
    >
      + New Tag
    </button>
    <CreateTagModal v-if="showCreateTagModal" :boardId="boardId" @close="showCreateTagModal = false" />
  </div>
</template>

<script setup lang="ts">
import { getIcon } from '../utils/icons'
import type { Tag } from '~/server/db/schema'

const props = defineProps<{
  availableTags: Tag[]
  selectedTagIds: string[]
  boardId: string
}>()

const emit = defineEmits(['update:selectedTagIds'])
const showCreateTagModal = ref(false)

function isSelected(tagId: string) {
  return props.selectedTagIds.includes(tagId)
}

function toggleTag(tagId: string) {
  const newSelection = [...props.selectedTagIds]
  if (newSelection.includes(tagId)) {
    newSelection.splice(newSelection.indexOf(tagId), 1)
  } else {
    newSelection.push(tagId)
  }
  emit('update:selectedTagIds', newSelection)
}
</script>
