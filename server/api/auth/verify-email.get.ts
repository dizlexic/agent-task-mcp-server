import { eq, and, gt } from 'drizzle-orm'
import { db } from '../../db'
import { emailVerificationTokens, users } from '../../db/schema'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const token = query.token

  if (!token || typeof token !== 'string') {
    throw createError({ statusCode: 400, statusMessage: 'Token is required' })
  }

  const verificationToken = await db.select().from(emailVerificationTokens)
    .where(and(
      eq(emailVerificationTokens.token, token),
      gt(emailVerificationTokens.expiresAt, new Date())
    ))
    .then(res => res[0])

  if (!verificationToken) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid or expired token' })
  }

  await db.update(users).set({ isVerified: true }).where(eq(users.id, verificationToken.userId))
  await db.delete(emailVerificationTokens).where(eq(emailVerificationTokens.id, verificationToken.id))
  
  return { success: true, message: 'Email verified' }
})
