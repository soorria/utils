import { json, LoaderFunction, Outlet, useLoaderData } from 'remix'
import UtilLayout from '~/components/ui/layouts/UtilLayout'
import { commonMetaFactory } from '~/lib/all-utils'
import { getUtilBySlug, Util } from '~/lib/all-utils.server'
import { ClientOnly } from 'remix-utils'
import { QuickCopyProvider } from '~/lib/quick-copy'

export const meta = commonMetaFactory()

type LoaderData = {
  utilData: Util
}

export const loader: LoaderFunction = async ({ request }) => {
  const utilData = getUtilBySlug('quick-copy')

  return json<LoaderData>({ utilData })
}

const QuickCopy: React.FC = () => {
  return (
    <>
      <Outlet />
    </>
  )
}

const QuickCopyRoute = () => {
  const { utilData } = useLoaderData<LoaderData>()

  return (
    <UtilLayout className="flex flex-col" util={utilData}>
      <ClientOnly>
        {() => (
          <QuickCopyProvider>
            <QuickCopy />
          </QuickCopyProvider>
        )}
      </ClientOnly>
    </UtilLayout>
  )
}

export default QuickCopyRoute
