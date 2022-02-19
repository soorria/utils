import {
  ActionFunction,
  Form,
  json,
  LoaderFunction,
  useLoaderData,
} from 'remix'
import { setPrefsToSession, themeNames } from '~/lib/prefs.server'
import { commitSession, destroySession, getSession } from '~/lib/session.server'
import { capitalise } from '~/lib/utils'
import { useRootLoaderData } from '~/root'

export const action: ActionFunction = async ({ request }) => {
  const session = await getSession(request.headers.get('Cookie'))
  const formData = await request.formData()
  const action = formData.get('_action')

  if (action === 'destroy') {
    return json(
      {},
      { headers: { 'Set-Cookie': await destroySession(session) } }
    )
  }

  const data = {
    theme: formData.get('theme') as string,
  }

  setPrefsToSession(data, session)

  return json({}, { headers: { 'Set-Cookie': await commitSession(session) } })
}

type LoaderData = {
  themes: typeof themeNames
}

export const loader: LoaderFunction = () => {
  return { themes: themeNames }
}

const OptionsPage: React.FC = () => {
  const { themes } = useLoaderData<LoaderData>()
  const rootData = useRootLoaderData()

  return (
    <main className="space-y-8">
      <h2 className="text-5xl mt-8 text-primary">options</h2>
      <Form method="post" className="space-y-8">
        <fieldset role="radiogroup" className="form-control space-y-4">
          <legend className="label text-xl">theme</legend>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {themes.map(theme => (
              <div
                key={theme}
                data-theme={theme}
                className="p-2 -m-2 bg-base-100 rounded-[1.25rem]"
              >
                <input
                  type="radio"
                  value={theme}
                  name="theme"
                  className="sr-only peer"
                  id={theme}
                  defaultChecked={rootData.theme === theme}
                />
                <div className="p-2 peer-checked:ring ring-primary transition-shadow rounded-xl">
                  <label htmlFor={theme}>
                    <span className="btn btn-xl btn-block btn-primary rounded-lg">
                      {capitalise(theme)}
                    </span>
                  </label>
                </div>
              </div>
            ))}
          </div>
        </fieldset>

        <button
          className="btn btn-primary btn-block"
          type="submit"
          name="_action"
          value="save"
        >
          save preferences
        </button>

        <button
          className="btn btn-ghost btn-block"
          type="submit"
          name="_action"
          value="destroy"
        >
          destroy(!) preferences
        </button>
      </Form>
    </main>
  )
}

export default OptionsPage
