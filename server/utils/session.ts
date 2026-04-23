import { useSession, createError } from 'h3'
import { defu } from 'defu'

/**
 * Get the user session from the cookie.
 */
export async function getUserSession(event: any) {
  const session = await _useRawSession(event)
  return session.data || { user: null }
}

/**
 * Set the user session in the cookie.
 */
export async function setUserSession(event: any, data: any) {
  const session = await _useRawSession(event)
  await session.update(data)
  return data
}

/**
 * Replace the user session with new data.
 */
export async function replaceUserSession(event: any, data: any) {
  const session = await _useRawSession(event)
  await session.clear()
  await session.update(data)
  return data
}

/**
 * Clear the user session.
 */
export async function clearUserSession(event: any) {
  const session = await _useRawSession(event)
  const data = session.data
  // @ts-ignore: sessionHooks might be globally available or imported in a way I don't see
  await sessionHooks.callHookParallel('clear', data, event)
  await session.clear()
  return true
}

/**
 * Require a user session, throws 401 if not logged in.
 */
export async function requireUserSession(event: any, opts: { statusCode?: number; message?: string } = {}) {
  const userSession = await getUserSession(event)
  if (!userSession.user) {
    throw createError({
      statusCode: opts.statusCode || 401,
      message: opts.message || 'Unauthorized',
    })
  }
  return userSession
}

/**
 * Internal helper to get the raw h3 session (sealed cookie).
 */
function _useRawSession(event: any) {
  const runtimeConfig = useRuntimeConfig(event)
  const sessionConfig = defu(runtimeConfig.session, {
    name: 'nuxt-session',
    password: process.env.NUXT_SESSION_PASSWORD || '',
    cookie: {
      sameSite: 'lax'
    }
  })
  return useSession(event, sessionConfig)
}
