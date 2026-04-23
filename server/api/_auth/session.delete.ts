import { eventHandler } from 'h3'

export default eventHandler(async (event) => {
  await clearUserSession(event)
  return { cleared: true }
})
