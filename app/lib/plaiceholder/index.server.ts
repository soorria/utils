import { getPlaiceholder, IGetPlaiceholderReturn } from 'plaiceholder'
import { z } from 'zod'

export type PlaiceholderResultOptions = IGetPlaiceholderReturn
export type PlaiceholderResult = {
  fileName: string
  placeholders: PlaiceholderResultOptions
}[]

export const getPlaiceholdersForFiles = async (
  files: File[]
): Promise<PlaiceholderResult> => {
  const tuples = await Promise.all(
    files.map(async file => ({
      fileName: file.name,
      placeholders: await getPlaiceholder(
        Buffer.from(await file.arrayBuffer())
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

export type PlaiceholderRequestErrors = z.inferFlattenedErrors<
  typeof plaiceholderRequestBodySchema
>
