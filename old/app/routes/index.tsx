import { json } from '@remix-run/node'
import { ExclamationIcon } from '@heroicons/react/solid'
import MainHeading from '~/components/ui/MainHeading'
import { allUtils, Util } from '~/lib/all-utils.server'
import { Tag } from '~/lib/all-utils'
import Link from '~/components/BaseLink'
import MainLayout from '~/components/ui/layouts/MainLayout'
import { passthroughCachingHeaderFactory } from '~/lib/headers'
import { cx } from '~/lib/utils'
import type { ReactNode } from 'react'
import { useLoaderData } from '@remix-run/react'

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
const TagBadge = (props: { tag: Tag }) => {
  const { className, label } = tagDetailsMap[props.tag]
  return (
    <span className={cx('badge font-mono font-bold', className)}>{label}</span>
  )
}

const Index = () => {
  const data = useLoaderData<LoaderData>()

  return (
    <MainLayout>
      <MainHeading>All Utils</MainHeading>

      <p className="text-2xl">
        A bunch of micro-apps that are too small for creating a new project to
        be worth it. Some of them are useful, others less ...
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
        {data.utils.map(util => (
          <Link
            to={util.path}
            key={util.slug}
            className="focus-outline flex font-display flex-col space-y-4 p-4 sm:p-6 bg-base-300 rounded-btn hover:shadow-lg transition group"
          >
            <span className="text-xl font-bold transition-colors group-hover:underline">
              {util.title}
            </span>

            <span className="min-h-12">{util.description}</span>

            {util.tags?.length ? (
              <div className="!-mt-0 -ml-4">
                {util.tags.map(tag => (
                  <span key={tag} className="inline-block ml-4 mt-4">
                    <TagBadge tag={tag} />
                  </span>
                ))}
              </div>
            ) : null}
          </Link>
        ))}
      </div>
    </MainLayout>
  )
}

export default Index
