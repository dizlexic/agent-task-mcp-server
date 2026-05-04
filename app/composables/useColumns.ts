import type { BoardColumn } from '../../server/db/schema'
import { COLUMNS } from '../utils/task-constants'

export function useColumns(boardId: string) {
  const columns = useState<BoardColumn[]>(`columns-${boardId}`, () => [])
  const loading = useState(`columns-loading-${boardId}`, () => false)

  async function fetchColumns() {
    loading.value = true
    try {
      columns.value = await $fetch<BoardColumn[]>(`/api/boards/${boardId}/columns`)
    } finally {
      loading.value = false
    }
  }

  async function updateColumn(columnId: string, data: Partial<Pick<BoardColumn, 'name' | 'description' | 'instructions'>>) {
    await $fetch(`/api/boards/${boardId}/columns/${columnId}`, { method: 'PATCH', body: data })
    const idx = columns.value.findIndex(c => c.id === columnId)
    if (idx !== -1) {
      columns.value[idx] = { ...columns.value[idx], ...data }
    }
  }

  return { columns, loading, fetchColumns, updateColumn }
}
