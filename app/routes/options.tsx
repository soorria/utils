import { useEffect, useRef, useState } from 'react'
import {
  ActionFunction,
  Form,
  json,
  LoaderFunction,
  useLoaderData,
  useTransition,
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
    await destroySession(session)

    return json({}, { headers: { 'Set-Cookie': await commitSession(session) } })
  }

  const data = {
    js: formData.get('js') === 'on',
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

const ids = { js: 'js', theme: 'theme' }

const OptionsPage: React.FC = () => {
  const { themes } = useLoaderData<LoaderData>()
  const rootData = useRootLoaderData()
  const [key, setKey] = useState(0)
  const transition = useTransition()
  const prevSubmissionDataRef = useRef<Record<string, any>>()

  useEffect(() => {
    const prevdata = { ...prevSubmissionDataRef.current }

    if (prevSubmissionDataRef.current && !transition.submission) {
      setKey(p => p + 1)
      const prevSubmittedJsPreference = prevdata.js
      console.log('key updated', { prevSubmittedJsPreference, prevdata })
      if (prevSubmittedJsPreference !== 'on') {
        window.location.reload()
      }
    }

    prevSubmissionDataRef.current = prevSubmissionDataRef.current
      ? prevSubmissionDataRef.current
      : {}
  }, [transition.submission])

  return (
    <main className="space-y-8" key={key}>
      <h2 className="text-5xl mt-8 text-primary">options</h2>
      <Form method="post" className="space-y-8">
        <div className="form-control flex-row justify-between items-center">
          <label
            className="label cursor-pointer flex-1 text-xl"
            htmlFor={ids.js}
          >
            enable javascript
          </label>
          <input
            id={ids.js}
            name="js"
            type="checkbox"
            className="toggle toggle-primary"
            defaultChecked={rootData.js}
          />
        </div>

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
