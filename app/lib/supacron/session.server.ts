import { createCookieSessionStorage } from 'remix'
import { slug } from './details.server'

export const sbConnStringSession = createCookieSessionStorage({
  cookie: {
    name: 'sb-conn-string',
    httpOnly: true,
    path: `/${slug}`,
    sameSite: 'strict',
  },
})
