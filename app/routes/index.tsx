import { json, useLoaderData } from 'remix'
import MainHeading from '~/components/ui/MainHeading'
import { allUtils, Util } from '~/lib/all-utils.server'
import Link from '~/components/BaseLink'

type LoaderData = {
  utils: Util[]
}

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
    <main className="space-y-8">
      <MainHeading>All Utils</MainHeading>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
        {data.utils.map(util => (
          <Link
            to={util.path}
            key={util.slug}
            className="focus-outline flex flex-col space-y-4 p-4 sm:p-6 bg-base-300 rounded-btn hover:shadow-md transition"
          >
            <span className="text-xl">{util.title}</span>
            <span>{util.description}</span>
          </Link>
        ))}
      </div>
    </main>
  )
}

export default Index
