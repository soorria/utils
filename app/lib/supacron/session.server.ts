import { createCookieSessionStorage, createCookie } from 'remix'
import { isProd } from '~/constants.server'
import { slug } from './details.server'

const cookie = createCookie('sb-conn-string', {
  httpOnly: true,
  path: `/${slug}`,
  sameSite: 'strict',
  // secrets: [process.env.OOOKIE_SECRET],
  secure: isProd,
  maxAge: 604800,
})

export const sbConnStringSession = createCookieSessionStorage({
  cookie,
})
