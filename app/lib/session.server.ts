import { createCookieSessionStorage } from 'remix'

const { getSession, commitSession, destroySession } =
  createCookieSessionStorage()

export { getSession, commitSession, destroySession }
