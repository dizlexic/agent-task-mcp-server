import { getIO } from '../plugins/socket'

export type TaskEvent = 'task:created' | 'task:updated' | 'task:deleted'

export function emitTaskEvent(boardId: string, event: TaskEvent, data: any) {
  const io = getIO()
  if (!io) return
  io.to(`board:${boardId}`).emit(event, data)
}
