import {
  ActionFunctionArgs,
  json,
  LoaderFunction,
  redirect,
} from '@remix-run/node'
import { Form, Outlet, useLoaderData } from '@remix-run/react'
import { ClientOnly } from 'remix-utils/client-only'
import Dialog, {
  DialogActions,
  DialogBox,
  DialogCloseAction,
  DialogDescription,
  DialogHeading,
  useDialog,
} from '~/components/ui/Dialog'
import UtilLayout from '~/components/ui/layouts/UtilLayout'
import { ActionMethodInput, getActionFromFormData } from '~/lib/action-utils'
import { commonMetaFactory } from '~/lib/all-utils'
import { getUtilBySlug, Util } from '~/lib/all-utils.server'
import { getConfigFromSession, parseConnectionString, setConfigToSession, withClient } from '~/lib/supacron/pg.server'
import { checkPgCronExtension } from '~/lib/supacron/queries.server'
import { sbConnStringSession } from '~/lib/supacron/session.server'
import { cx, getCookieHeader } from '~/lib/utils'

export const meta = commonMetaFactory()

export type ActionData = {
  connectionString: string
  formErrors?: string[]
  connectionErrors?: string[]
}

export const action = async ({ request }: ActionFunctionArgs) => {
  const formdata = await request.formData()

  const action = getActionFromFormData(formdata)

  const session = await sbConnStringSession.getSession(getCookieHeader(request))

  if (action === 'logout') {
    return redirect(getUtilBySlug('supacron').path, {
      headers: {
        'Set-Cookie': await sbConnStringSession.destroySession(session),
      },
    })
  }

  const connectionString = formdata.get('connectionString')

  if (typeof connectionString !== 'string') {
    return json({})
  }

  const parseResult = parseConnectionString(connectionString)
  if (!parseResult.success) {
    const flattenedErrors = parseResult.error.flatten()
    const errors = [
      ...flattenedErrors.formErrors,
      ...Object.values(flattenedErrors.fieldErrors).flat(),
    ]
    return json<ActionData>({ formErrors: errors, connectionString }, {})
  }

  const connectionConfig = parseResult.data

  try {
    await withClient(connectionConfig, async client => {
      await checkPgCronExtension(client)
    })
  } catch (err) {
    return json<ActionData>(
      {
        connectionErrors: [
          err instanceof Error
            ? err.message
            : 'Something went wrong checking pg_cron in your database',
        ],
        connectionString,
      },
      {}
    )
  }

  setConfigToSession(session, connectionConfig)

  return redirect(`${getUtilBySlug('supacron').slug}/jobs`, {
    headers: {
      'Set-Cookie': await sbConnStringSession.commitSession(session),
    },
  })
}

type LoaderData = {
  utilData: Util
  authed: boolean
  database?: string
  flashError?: string | null
}

export const loader: LoaderFunction = async ({ request }) => {
  const utilData = getUtilBySlug('supacron')

  const session = await sbConnStringSession.getSession(getCookieHeader(request))

  const connectionConfig = getConfigFromSession(session)

  const authed = Boolean(connectionConfig)
  const database = connectionConfig?.database

  const url = new URL(request.url)

  if (url.pathname === utilData.path && authed) {
    return redirect(`${utilData.path}/jobs`)
  }

  return json<LoaderData>({ utilData, authed, database })
}

export type SupacronOutletData = Omit<LoaderData, 'flashError'>

const SupaCron = () => {
  const { utilData, authed, database } = useLoaderData<LoaderData>()
  const dialog = useDialog({ id: 'disconnect-db' })

  const outletData: SupacronOutletData = { utilData, authed, database }

  return (
    <UtilLayout className="flex flex-col" util={utilData}>
      <div className="space-y-8 flex-1">
        <Outlet context={outletData} />
      </div>

      {authed && (
        <div className="max-w-xs mx-auto w-full">
          <ClientOnly
            fallback={
              <Form replace method="post">
                <ActionMethodInput action="logout" />
                <button type="submit" className={cx('btn btn-ghost btn-block')}>
                  Disconnect from database
                </button>
              </Form>
            }
          >
            {() => (
              <>
                <button
                  type="button"
                  className={cx('btn btn-sm btn-ghost btn-block')}
                  {...dialog.api.triggerProps}
                >
                  Disconnect from database
                </button>
                <Dialog api={dialog.api}>
                  <DialogBox>
                    <DialogHeading>Disconnect from database</DialogHeading>
                    <DialogDescription>
                      Are you sure you want to disconnect this browser from your
                      database?
                    </DialogDescription>
                    <DialogActions>
                      <DialogCloseAction>Cancel</DialogCloseAction>
                      <Form replace method="post">
                        <ActionMethodInput action="logout" />
                        <button type="submit" className={cx('btn btn-primary')}>
                          Disconnect
                        </button>
                      </Form>
                    </DialogActions>
                  </DialogBox>
                </Dialog>
              </>
            )}
          </ClientOnly>
        </div>
      )}
    </UtilLayout>
  )
}

export default SupaCron
