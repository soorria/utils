import invariant from 'tiny-invariant'
import { details as supacronDetails } from './supacron'
export type Util = {
  path: string
  slug: string
  title: string
  description: string
  api?: boolean
}

const _allUtils = [
  {
    slug: 'sizes',
    title: 'Sizes',
    description: 'See the size of files or text in the deflate, gzip and brotli formats',
    api: true,
  },
  {
    slug: 'remove-types',
    title: 'Remove Types',
    description: 'Remove types from some TypeScript code',
  },
  {
    slug: supacronDetails.slug,
    title: 'SupaCron',
    description: 'UI to manage your pg_cron cron jobs. Mainly designed for use with Supabase',
  },
] as const
export const allUtils: Util[] = _allUtils.map(u => ({
  ...u,
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
