import { LoaderFunctionArgs, redirect } from '@remix-run/node'
import { getUtilBySlug } from '~/lib/all-utils.server'
import { sbConnStringSession } from '~/lib/supacron/session.server'
import { getCookieHeader } from '~/lib/utils'

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const session = await sbConnStringSession.getSession(getCookieHeader(request))

  return redirect(getUtilBySlug('supacron').path, {
    headers: {
      'Set-Cookie': await sbConnStringSession.destroySession(session),
    },
  })
}
