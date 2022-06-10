import { ActionFunction, Form, json, LoaderFunction, useLoaderData } from 'remix'
import UtilLayout from '~/components/ui/layouts/UtilLayout'
import { commonMetaFactory } from '~/lib/all-utils'
import type { Util } from '~/lib/all-utils.server'
import { prefsCookie, setPrefsToSession, themeNames } from '~/lib/prefs.server'
import { cx } from '~/lib/utils'
import { useRootLoaderData } from '~/root'

export const meta = commonMetaFactory<LoaderData>()

export const action: ActionFunction = async ({ request }) => {
  const session = await prefsCookie.getSession(request.headers.get('Cookie'))
  const formData = await request.formData()
  const action = formData.get('_action')

  if (action === 'destroy') {
    return json({}, { headers: { 'Set-Cookie': await prefsCookie.destroySession(session) } })
  }

  const data = {
    theme: formData.get('theme') as string,
  }

  setPrefsToSession(data, session)

  return json({}, { headers: { 'Set-Cookie': await prefsCookie.commitSession(session) } })
}

type LoaderData = {
  themes: typeof themeNames
  utilData: Util
}

export const loader: LoaderFunction = () => {
  return json<LoaderData>(
    {
      themes: themeNames,
      utilData: {
        description: '29+ themes!',
        path: '/theme',
        slug: 'theme',
        title: 'Theme',
      },
    },
    {
      headers: {
        'Cache-Control': 'public, s-maxage=31536000',
      },
    }
  )
}

const OptionsPage: React.FC = () => {
  const { themes, utilData } = useLoaderData<LoaderData>()
  const rootData = useRootLoaderData()

  return (
    <UtilLayout util={utilData}>
      <Form replace method="post" className="space-y-8">
        <fieldset role="radiogroup" className="form-control space-y-4">
          <legend className="label text-xl">theme</legend>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 p-2 focus-within-outline rounded-[1.25rem]">
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
                  defaultChecked={
                    rootData.prefs.theme === theme && rootData.prefs.realTheme !== '$$random'
                  }
                />
                <div
                  className={cx(
                    'p-2 peer-checked:ring transition-shadow rounded-xl',
                    rootData.prefs.realTheme === '$$random' && rootData.prefs.theme == theme
                      ? 'ring ring-secondary'
                      : 'ring-primary'
                  )}
                >
                  <label htmlFor={theme}>
                    <span className="btn no-ring btn-xl btn-block btn-primary rounded-lg">
                      {theme}
                    </span>
                  </label>
                </div>
              </div>
            ))}
            <div
              className={`p-2 -m-2 bg-rainbow rounded-[1.25rem] ${
                rootData.prefs.realTheme === '$$random' ? 'bg-rainbow-animate' : ''
              }`}
            >
              <input
                type="radio"
                value="$$random"
                name="theme"
                className="sr-only peer"
                id="$$random"
                defaultChecked={rootData.prefs.realTheme === '$$random'}
              />
              <div className="p-2 peer-checked:ring ring-black transition-shadow rounded-xl">
                <label htmlFor="$$random">
                  <span className="btn no-ring btn-xl btn-block btn-primary rounded-lg">
                    Random
                  </span>
                </label>
              </div>
            </div>
          </div>
        </fieldset>

        <button className="btn btn-primary btn-block" type="submit" name="_action" value="save">
          save preferences
        </button>

        <button className="btn btn-ghost btn-block" type="submit" name="_action" value="destroy">
          destroy(!) preferences
        </button>
      </Form>
    </UtilLayout>
  )
}

export default OptionsPage
