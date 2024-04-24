import readingTime from 'reading-time'
import { z } from 'zod'

export type WC = {
  bytes: number
  chars: number
  words: number
  lines: number
  readingTime: string
}

export type DoWCInput = {
  text?: string
  files: File[]
}

export type DoWCResult = {
  text?: WC
  total: Omit<WC, 'readingTime'>
  files: Array<{ name: string; wc: WC }>
}

const doSingleWC = async (fileOrText: File | string): Promise<WC> => {
  let text: string
  let bytes: number
  if (fileOrText instanceof File) {
    text = await fileOrText.text()
    bytes = fileOrText.size
  } else {
    text = fileOrText
    bytes = text.length
  }
  const { words, text: readingTimeText } = readingTime(text)
  const lines = text.split('\n').length

  return {
    readingTime: readingTimeText,
    words,
    lines,
    bytes,
    chars: charLength(text),
  }
}

// yay JavaScript!!
const charLength = (str: string) => [...str].length

export const doWC = async ({ text, files }: DoWCInput): Promise<DoWCResult> => {
  const result: DoWCResult = {
    files: [],
    total: {
      bytes: 0,
      chars: 0,
      lines: 0,
      words: 0,
    },
  }

  if (text) {
    const textResult = await doSingleWC(text)
    const { readingTime: _, ...copyWithoutReadingTime } = textResult
    result.total = copyWithoutReadingTime
    result.text = textResult
  }

  if (files.length) {
    result.files = await Promise.all(
      files.map(async file => {
        return {
          name: file.name,
          wc: await doSingleWC(file),
        }
      })
    )

    const fields = Object.keys(result.total) as Array<keyof DoWCResult['total']>

    result.files.forEach(file => {
      fields.forEach(field => {
        result.total[field] += file.wc[field]
      })
    })
  }

  return result
}

export const wcRequestBodySchema = z
  .object({
    text: z.string().optional(),
    files: z
      .instanceof(File, { message: 'files should only contain Files' })
      .array()
      .transform(files => files.filter(file => Boolean(file.name))),
  })
  .superRefine((val, ctx) => {
    if (!val.text && !val.files?.length) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        fatal: true,
        message: 'you must provide at least one of text or files',
      })
    }
  })

export type WCRequest = z.infer<typeof wcRequestBodySchema>
export type WCRequestErrors = z.inferFlattenedErrors<typeof wcRequestBodySchema>
