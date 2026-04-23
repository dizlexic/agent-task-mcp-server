import { getRouterParam } from 'h3'
import { eq } from 'drizzle-orm'
import { db } from '../../../db'
import { instructions } from '../../../db/schema'
import { DEFAULT_AGENT_INSTRUCTIONS, DEFAULT_TASK_WORKFLOW } from '../../../db/defaults'

const defaults: Record<string, string> = {
  agent_instructions: DEFAULT_AGENT_INSTRUCTIONS,
  task_workflow: DEFAULT_TASK_WORKFLOW,
}

export default defineEventHandler(async (event) => {
  await requireUserSession(event)
  const id = getRouterParam(event, 'id')!

  const results = await db.select().from(instructions).where(eq(instructions.id, id))
  const existing = results[0]
  if (!existing) {
    throw createError({ statusCode: 404, statusMessage: 'Instruction not found' })
  }

  const defaultContent = defaults[existing.type]
  if (!defaultContent) {
    throw createError({ statusCode: 400, statusMessage: 'No default available for this type' })
  }

  await db.update(instructions).set({
    content: defaultContent,
    isDefault: true,
    updatedAt: new Date(),
    updatedBy: null,
  }).where(eq(instructions.id, id))

  const finalResults = await db.select().from(instructions).where(eq(instructions.id, id))
  return finalResults[0]
})
