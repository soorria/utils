import invariant from 'tiny-invariant'
import { Tag } from './all-utils'
import { details as supacronDetails } from './supacron'

export type Util = {
  path: string
  slug: string
  title: string
  description: string
  tags?: Tag[]
}

const _allUtils = [
  {
    slug: 'sizes',
    title: 'Sizes',
    description: 'See the size of files or text in the deflate, gzip and brotli formats',
    tags: [Tag.API],
  },
  {
    slug: 'remove-types',
    title: 'Remove Types',
    description: 'Remove types from some TypeScript code',
  },
  {
    slug: 'quick-copy',
    title: 'Quick Copy',
    description:
      'Manage a list of text you want to copy in groups later. Useful to make sure comments are consistent when marking assignments, etc.',
    tags: [Tag.NEEDS_JS],
  },
  {
    slug: supacronDetails.slug,
    title: 'SupaCron',
    description: 'UI to manage your pg_cron cron jobs. Mainly designed for use with Supabase',
  },
  {
    slug: 'link-lines',
    title: 'Link Lines',
    description: 'Get links from some text, split on any whitespace',
  },
] as const
export const allUtils: Util[] = _allUtils.map(u => ({
  ...u,
  tags: [...((u as Util).tags || [])],
  path: (u as Util).path || `/${u.slug}`,
}))

type UtilSlug = typeof _allUtils[number]['slug']

const utilBySlug = Object.fromEntries(allUtils.map(util => [util.slug, util])) as Readonly<
  Record<UtilSlug, Util>
>

export const getUtilBySlug = (slug: UtilSlug): Util => {
  const u = utilBySlug[slug]
  invariant(u, `Util for slug '${slug}' does not exist`)
  return u
}
