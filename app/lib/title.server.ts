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
    const [title, weightStr] = line.split(',')
    const weight = parseFloat(weightStr)
    return Number.isFinite(weight) ? [title, weight] : [title]
  })

  return titlesSingletonSchema.parseAsync(rows)
}

export const getRandomTitle = async (): Promise<string> => {
  if (client) {
    const result = await client
      .from<{ id: number; slug: string; content: string }>('singletons')
      .select('*')
      .eq('slug', DB_SLUG)
      .maybeSingle()

    if (result.data) {
      try {
        const titles = await parseContent(result.data.content)
        return weightedRandomItem(titles)
      } catch (err) {
        if (process.env.NODE_ENV !== 'production') {
          console.log('singleton was bad', result)
        }
      }
    }
  }

  return DEFAULT_TITLE
}
