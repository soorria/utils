import { json, useLoaderData } from 'remix'
import { ExclamationIcon } from '@heroicons/react/solid'
import MainHeading from '~/components/ui/MainHeading'
import { allUtils, Util } from '~/lib/all-utils.server'
import { Tag } from '~/lib/all-utils'
import Link from '~/components/BaseLink'
import MainLayout from '~/components/ui/layouts/MainLayout'
import { passthroughCachingHeaderFactory } from '~/lib/headers'
import { cx } from '~/lib/utils'
import type { ReactNode } from 'react'

type LoaderData = {
  utils: Util[]
}

export const headers = passthroughCachingHeaderFactory()

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

const tagDetailsMap: Record<Tag, { className: string; label: ReactNode }> = {
  [Tag.API]: {
    className: 'badge-primary',
    label: '+ API',
  },
  [Tag.NEEDS_JS]: {
    className: 'badge-warning',
    label: 'NEEDS JS',
  },
  [Tag.WIP]: {
    className: 'badge-error',
    label: (
      <>
        <ExclamationIcon className="w-3 h-3 mr-1" /> WIP
      </>
    ),
  },
}
const TagBadge: React.FC<{ tag: Tag }> = props => {
  const { className, label } = tagDetailsMap[props.tag]
  return (
    <span className={cx('badge font-mono font-bold', className)}>{label}</span>
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
            <span className="flex space-x-4 items-center">
              <span className="text-xl font-bold font-display transition-colors group-hover:underline">
                {util.title}
              </span>
              <div className="flex-1" />
            </span>
            <span className="min-h-12">{util.description}</span>
            <div className="!-mt-0 -ml-4">
              {util.tags?.map(tag => (
                <span key={tag} className="inline-block ml-4 mt-4">
                  <TagBadge tag={tag} />
                </span>
              ))}
            </div>
          </Link>
        ))}
      </div>
    </MainLayout>
  )
}

export default Index
