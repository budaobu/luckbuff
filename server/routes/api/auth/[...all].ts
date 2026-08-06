import { auth } from '~~/server/utils/auth'

// Mounts the Better Auth handler for every /api/auth/* endpoint
// (sign-in, OAuth callbacks, session, sign-out, etc).
export default defineEventHandler((event) => {
  return auth.handler(toWebRequest(event))
})
