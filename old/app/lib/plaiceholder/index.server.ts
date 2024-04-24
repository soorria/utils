import { getPlaiceholder, IGetPlaiceholderReturn } from 'plaiceholder'
import { z } from 'zod'
import { clamp } from '../utils'

export type PlaiceholderResultOptions = IGetPlaiceholderReturn
export type PlaiceholderResult = {
  fileName: string
  placeholders: PlaiceholderResultOptions
}[]

export const getPlaiceholdersForFiles = async (
  files: File[],
  size = 4
): Promise<PlaiceholderResult> => {
  size = clamp(size, 4, 64)

  const tuples = await Promise.all(
    files.map(async file => ({
      fileName: file.name,
      placeholders: await getPlaiceholder(
        Buffer.from(await file.arrayBuffer()),
        {
          size,
        }
      ),
    }))
  )

  return tuples.sort((a, b) =>
    a.fileName.toLowerCase().localeCompare(b.fileName.toLowerCase())
  )
}

export const plaiceholderRequestBodySchema = z
  .object({
    images: z
      .instanceof(File, { message: 'files should only contain Files' })
      .array()
      .transform(files => files.filter(file => Boolean(file.name))),
    size: z
      .string()
      .optional()
      .default('4')
      .transform(str => {
        const parsed = parseInt(str)
        if (Number.isNaN(parsed)) return 4
        return parsed
      })
      .transform(n => clamp(n, 4, 64)),
  })
  .superRefine(({ images }, ctx) => {
    if (!images.length) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        fatal: true,
        message: 'you must provide at least one image',
      })
    }
  })

export type PlaiceholderRequestBody = z.infer<
  typeof plaiceholderRequestBodySchema
>
export type PlaiceholderRequestErrors = z.inferFlattenedErrors<
  typeof plaiceholderRequestBodySchema
>
