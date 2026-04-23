import { readBody, getRouterParam } from 'h3'
import { eq } from 'drizzle-orm'
import { db } from '../../db'
import { instructions } from '../../db/schema'

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event)
  const id = getRouterParam(event, 'id')!
  const body = await readBody(event)

  const results = await db.select().from(instructions).where(eq(instructions.id, id))
  const existing = results[0]
  if (!existing) {
    throw createError({ statusCode: 404, statusMessage: 'Instruction not found' })
  }

  if (!body?.content || typeof body.content !== 'string' || !body.content.trim()) {
    throw createError({ statusCode: 400, statusMessage: 'Content is required' })
  }

  await db.update(instructions).set({
    content: body.content.trim(),
    isDefault: false,
    updatedAt: new Date(),
    updatedBy: session.user.id,
  }).where(eq(instructions.id, id))

  const finalResults = await db.select().from(instructions).where(eq(instructions.id, id))
  return finalResults[0]
})
