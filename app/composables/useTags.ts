import type { Tag } from '../../server/db/schema'

export function useTags(boardId: string) {
  const tags = useState<Tag[]>(`tags-${boardId}`, () => [])
  const taskTags = useState<any[]>(`task-tags-${boardId}`, () => [])

  async function fetchTags() {
    tags.value = await $fetch<Tag[]>(`/api/boards/${boardId}/tags`)
  }

  async function fetchTaskTags() {
    taskTags.value = await $fetch<any[]>(`/api/boards/${boardId}/task-tags`)
  }

  async function addTagToTask(taskId: string, tagId: string) {
    const newLink = await $fetch(`/api/boards/${boardId}/tasks/${taskId}/tags`, {
      method: 'POST',
      body: { tagId }
    })
    await fetchTaskTags()
    return newLink
  }

  async function removeTagFromTask(taskId: string, tagId: string) {
    await $fetch(`/api/boards/${boardId}/tasks/${taskId}/tags/${tagId}`, {
      method: 'DELETE'
    })
    await fetchTaskTags()
  }

  async function createTag(data: { name: string, color: string, icon: string }) {
    const tag = await $fetch(`/api/boards/${boardId}/tags`, {
      method: 'POST',
      body: data
    })
    await fetchTags()
    return tag
  }

  async function deleteTag(tagId: string) {
    await $fetch(`/api/boards/${boardId}/tags/${tagId}`, {
      method: 'DELETE'
    })
    await fetchTags()
  }

  return { tags, taskTags, fetchTags, fetchTaskTags, addTagToTask, removeTagFromTask, createTag, deleteTag }
}
