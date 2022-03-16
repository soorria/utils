import { z } from 'zod'
import { client } from './supabase.server'
import { weightedRandomItem } from './utils'

const DEFAULT_TITLE = 'character counter'
const DB_SLUG = 'sizes:titles'

const titlesSingletonSchema = z.array(
  z.tuple([z.string()]).or(z.tuple([z.string(), z.number()]))
)

const parseContent = async (
  content: string
): Promise<z.infer<typeof titlesSingletonSchema>> => {
  const rows = content.split('\n').map(line => {
    const parts = line.split(',')
    const title = parts.slice(0, parts.length - 1).join(',')
    const weightStr = parts[parts.length - 1]
    const weight = parseFloat(weightStr)
    return Number.isFinite(weight) ? [title, weight] : [title]
  })

  return titlesSingletonSchema.parseAsync(rows)
}

let titles: z.infer<typeof titlesSingletonSchema> = []

export const getRandomTitle = async (): Promise<string> => {
  if (!client) {
    return DEFAULT_TITLE
  }

  if (titles.length <= 0) {
    const result = await client
      .from<{ id: number; slug: string; content: string }>('singletons')
      .select('*')
      .eq('slug', DB_SLUG)
      .maybeSingle()
    if (result.data) {
      try {
        titles = await parseContent(result.data.content)
      } catch (err) {
        if (process.env.NODE_ENV !== 'production') {
          console.log('singleton was bad', result)
        }
      }
    }
  }

  if (titles.length < 1) {
    return DEFAULT_TITLE
  }

  return weightedRandomItem(titles)
}
