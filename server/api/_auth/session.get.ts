import { eventHandler } from 'h3'
import {getUserSession} from "../../utils/session";

export default eventHandler(async (event) => {
  const session = await getUserSession(event)
  return session
})
