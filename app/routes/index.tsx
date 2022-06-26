import { json, useLoaderData } from 'remix'
import MainHeading from '~/components/ui/MainHeading'
import { allUtils, Util } from '~/lib/all-utils.server'
import Link from '~/components/BaseLink'
import MainLayout from '~/components/ui/layouts/MainLayout'

type LoaderData = {
  utils: Util[]
}

export const headers = () => ({
  'Cache-Control': 'public, s-maxage=31536000',
})

export const loader = () => {
  return json<LoaderData>(
    {
      utils: allUtils,
    },
    {
      headers: {
        'Cache-Control': 'public, s-maxage=31536000',
      },
    }
  )
}

const Index: React.FC = () => {
  const data = useLoaderData<LoaderData>()

  return (
    <MainLayout>
      <MainHeading>All Utils</MainHeading>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
        {data.utils.map(util => (
          <Link
            to={util.path}
            key={util.slug}
            className="focus-outline flex flex-col space-y-4 p-4 sm:p-6 bg-base-300 rounded-btn hover:shadow-lg transition group"
          >
            <span className="flex justify-between space-x-4 items-center">
              <span className="text-xl font-bold font-display transition-colors group-hover:underline">
                {util.title}
              </span>
              {util.api && <span className="badge badge-primary font-mono font-bold">+ API</span>}
            </span>
            <span>{util.description}</span>
          </Link>
        ))}
      </div>
    </MainLayout>
  )
}

export default Index
