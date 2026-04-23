import { nanoid } from 'nanoid'

export function generateId(size = 12): string {
  return nanoid(size)
}
