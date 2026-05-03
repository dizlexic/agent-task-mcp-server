import { db } from '../db'
import { boardLogs, type NewBoardLog } from '../db/schema'
import { generateId } from './id'

export async function logBoardEvent(log: Omit<NewBoardLog, 'id' | 'createdAt'>) {
  try {
    await db.insert(boardLogs).values({
      id: generateId(),
      createdAt: new Date(),
      ...log
    })
  } catch (error) {
    console.error('Failed to log board event:', error)
  }
}
