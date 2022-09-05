import {
  HeadersFunction,
  json,
  LoaderFunction,
  Outlet,
  useLoaderData,
  useParams,
} from 'remix'
import UtilLayout from '~/components/ui/layouts/UtilLayout'
import { commonMetaFactory } from '~/lib/all-utils'
import { getUtilBySlug, Util } from '~/lib/all-utils.server'
import { ClientOnly } from 'remix-utils'
import { QuickCopyProvider } from '~/lib/quick-copy'

export const meta = commonMetaFactory()

export const headers: HeadersFunction = () => {
  return {
    'Cache-Control': 'public, s-maxage=31536000',
  }
}

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

  const params = useParams<{ slug?: string }>()

  return (
    <UtilLayout className="flex flex-col" util={utilData}>
      <ClientOnly
        fallback={
          <div className="h-64 grid place-items-center">
            <div className="flex space-x-2 items-center">
              <span
                aria-hidden
                className="inline-block h-[1em] w-[1em] rounded-full border-2 animate-spin-fast border-primary border-b-primary/20 border-r-primary/20"
              />
              <span>Loading...</span>
            </div>
          </div>
        }
      >
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
