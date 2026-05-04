import { db } from '../db'
import { boardLogs, boards, type NewBoardLog } from '../db/schema'
import { generateId } from './id'
import { eq } from 'drizzle-orm'

export async function logBoardEvent(log: Omit<NewBoardLog, 'id' | 'createdAt'>) {
  try {
    await db.insert(boardLogs).values({
      id: generateId(),
      createdAt: new Date(),
      ...log
    })
    if (log.type !== 'user_connection') {
      await db.update(boards)
        .set({ lastActivityAt: new Date() })
        .where(eq(boards.id, log.boardId))
    }
  } catch (error) {
    console.error('Failed to log board event:', error)
  }
}
