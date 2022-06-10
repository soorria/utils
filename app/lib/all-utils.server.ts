import { details as supacronDetails } from './supacron'
export type Util = {
  path: string
  slug: string
  title: string
  description: string
}

const _allUtils: (Omit<Util, 'path'> & { path?: string })[] = [
  {
    slug: 'sizes',
    title: 'Sizes',
    description: 'See the size of files or text in the deflate, gzip and brotli formats',
  },
  {
    slug: 'remove-types',
    title: 'Remove Types',
    description: 'Remove types from some TypeScript code',
  },
  {
    slug: supacronDetails.slug,
    title: 'SupaCron',
    description: 'UI to manage your pg_cron cron jobs. Easiest with Supabase.',
  },
]
export const allUtils: Util[] = _allUtils.map(u => ({ ...u, path: u.path || `/${u.slug}` }))

export const utilByPath: Record<string, Util> = Object.fromEntries(
  allUtils.map(util => [util.slug, util])
)
