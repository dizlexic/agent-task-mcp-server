import { eventHandler } from 'h3'

export default eventHandler(async (event) => {
  const session = await getUserSession(event)
  if (session && Object.keys(session).length > 0) {
    await sessionHooks.callHookParallel('fetch', session, event)
  }
  return session
})
