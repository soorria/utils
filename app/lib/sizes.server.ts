import zlib from 'zlib'
import { promisify } from 'util'
import { Readable, PassThrough } from 'stream'

import { getResolvedPromiseValueOrDefault } from './utils'
import {
  BROTLI_LEVEL_RANGE,
  CompressionLevelRange,
  DEFLATE_LEVEL_RANGE,
  GZIP_LEVEL_RANGE,
} from './sizes'
import { z } from 'zod'

export type SizeFormats = 'initial' | 'gzip' | 'brotli' | 'deflate'
export type Sizes = Partial<Record<SizeFormats, number>>
export type SizesOptions = Omit<SizesRequest, 'text' | 'files'>

type SizeFunction = (text: string, level: number) => Promise<number>

type StreamToMeasure = Readable | NodeJS.ReadableStream
type SizeFromStream = (stream: StreamToMeasure) => Promise<number>

const getSizeWithKeyAndOptions = <Format extends string>(
  format: Format,
  promise: Promise<number | null>
): Promise<[Format, number | null]> =>
  promise
    .then(
      value => ({ status: 'fulfilled' as const, value }),
      reason => ({ status: 'rejected' as const, reason })
    )
    .then(result => getResolvedPromiseValueOrDefault(result, -1))
    .then(value => [format, value])

const getSizeIfEnabled = (
  fn: SizeFunction,
  text: string,
  enabled: boolean,
  level: number
): Promise<number | null> => (enabled ? fn(text, level) : Promise.resolve(null))

export const getSizes = async (
  stringOrFile: string | File,
  options: SizesOptions
): Promise<Sizes> => {
  const text =
    typeof stringOrFile === 'string' ? stringOrFile : await stringOrFile.text()

  const resultEntries = (
    await Promise.all([
      getSizeWithKeyAndOptions(
        'initial',
        getSizeIfEnabled(bytesSize, text, options.initialEnabled, -1)
      ),
      getSizeWithKeyAndOptions(
        'deflate',
        getSizeIfEnabled(
          deflateSize,
          text,
          options.deflateEnabled,
          options.deflateLevel
        )
      ),
      getSizeWithKeyAndOptions(
        'gzip',
        getSizeIfEnabled(gzipSize, text, options.gzipEnabled, options.gzipLevel)
      ),
      getSizeWithKeyAndOptions(
        'brotli',
        getSizeIfEnabled(
          brotliSize,
          text,
          options.brotliEnabled,
          options.brotliLevel
        )
      ),
    ])
  ).filter(([_, val]) => val !== null)

  return Object.fromEntries(resultEntries) as Sizes
}

const createStringStream = (string: string): Readable => {
  const stream = new Readable()
  stream.push(string)
  stream.push(null)
  return stream
}

export const getSizesUsingStream = async (
  stringOrFile: string | File
): Promise<Sizes> => {
  const stream =
    typeof stringOrFile === 'string'
      ? createStringStream(stringOrFile)
      : stringOrFile.stream()

  const [initial, gzip, brotli, deflate] = (
    await Promise.allSettled([
      bytesSizeFromStream(stream),
      gzipSizeFromStream(stream),
      brotliSizeFromStream(stream),
      deflateSizeFromStream(stream),
    ])
  ).map(result => getResolvedPromiseValueOrDefault(result, -1))

  return {
    initial,
    gzip,
    brotli,
    deflate,
  }
}

const bytesSize: SizeFunction = async text => {
  return new TextEncoder().encode(text).length
}

const bytesSizeFromStream: SizeFromStream = async stream => {
  const bytes = new PassThrough()
  let size = 0

  return new Promise(resolve => {
    bytes
      .on('data', buf => {
        size += (buf as Buffer).length
      })
      .on('error', () => resolve(-1))
      .on('end', () => resolve(size))
    stream.pipe(bytes)
  })
}

const deflate = promisify(zlib.deflate)
const deflateSize: SizeFunction = async (text, level) => {
  const compressed = await deflate(text, { level })
  return compressed.length
}

const deflateSizeFromStream: SizeFromStream = stream => {
  const deflate = zlib.createDeflate()
  let size = 0

  return new Promise(resolve => {
    deflate
      .on('data', buf => {
        size += (buf as Buffer).length
      })
      .on('error', () => resolve(-1))
      .on('end', () => resolve(size))
    stream.pipe(deflate)
  })
}

const gzip = promisify(zlib.gzip)
const gzipSize: SizeFunction = async (text, level) => {
  const compressed = await gzip(text, { level })
  return compressed.length
}

const gzipSizeFromStream: SizeFromStream = stream => {
  const gzip = zlib.createGzip({ level: 9 })
  let size = 0

  return new Promise(resolve => {
    gzip
      .on('data', buf => {
        size += (buf as Buffer).length
      })
      .on('error', () => resolve(-1))
      .on('end', () => resolve(size))
    stream.pipe(gzip)
  })
}

const brotli = promisify(zlib.brotliCompress)
const brotliSize: SizeFunction = async (text, level) => {
  const compressed = await brotli(text, {
    params: {
      [zlib.constants.BROTLI_PARAM_QUALITY]: level,
    },
  })
  return compressed.length
}

const brotliSizeFromStream: SizeFromStream = async stream => {
  throw new Error('TODO')
}

export type GetAllSizesInput = {
  text?: string | null
  files?: File[]
}

export type GetAllSizesResult = {
  text?: Sizes
  files: Record<string, Sizes>
}

export const getAllSizes = async (
  { text, files = [] }: GetAllSizesInput,
  options: SizesOptions
): Promise<GetAllSizesResult> => {
  if (typeof text !== 'string' && files.length === 0) {
    return { files: {} }
  }

  const promises: Promise<void>[] = []
  const result: GetAllSizesResult = { files: {} }

  if (typeof text === 'string') {
    promises.push(
      getSizes(text, options).then(sizes => {
        result.text = sizes
      })
    )
  }

  if (files.length) {
    files.forEach(file => {
      promises.push(
        getSizes(file, options).then(sizes => {
          result.files[file.name] = sizes
        })
      )
    })
  }

  await Promise.all(promises)

  return result
}

const booleanOrCheckboxValue = () =>
  z.union([z.boolean(), z.enum(['on'])], {
    errorMap(issue, ctx) {
      if (issue.code === z.ZodIssueCode.invalid_union) {
        return { message: "must be true, false or 'on'" }
      }
      return z.defaultErrorMap(issue, ctx)
    },
  })
const coerceOptionalBooleanOrCheckboxValueToBoolean = (
  val: boolean | 'on' | undefined
): boolean =>
  typeof val === 'boolean' ? val : typeof val === 'undefined' ? false : true

const stringToIntInRange = (range: CompressionLevelRange) =>
  z
    .string()
    .regex(/^\d+$/)
    .transform(parseInt)
    .refine(val => val >= range.min && val <= range.max, {
      message: `must be between ${range.min} and ${range.max}, inclusive`,
    })

export const sizesRequestBodySchema = z
  .object({
    text: z.string(),
    files: z
      .array(z.instanceof(File, { message: 'files should only contain Files' }))
      .transform(files => files.filter(file => Boolean(file.name))),
    initialEnabled: booleanOrCheckboxValue(),
    brotliEnabled: booleanOrCheckboxValue(),
    brotliLevel: stringToIntInRange(BROTLI_LEVEL_RANGE),
    gzipEnabled: booleanOrCheckboxValue(),
    gzipLevel: stringToIntInRange(GZIP_LEVEL_RANGE),
    deflateEnabled: booleanOrCheckboxValue(),
    deflateLevel: stringToIntInRange(DEFLATE_LEVEL_RANGE),
  })
  .partial()
  .superRefine((val, ctx) => {
    if (!val.text && !val.files?.length) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        fatal: true,
        message: 'you must provide at least one or text and files',
      })
    }
  })
  .transform(val => {
    val.initialEnabled = coerceOptionalBooleanOrCheckboxValueToBoolean(
      val.initialEnabled
    )

    if (typeof val.deflateLevel === 'undefined') {
      val.deflateLevel = DEFLATE_LEVEL_RANGE.def
    }
    val.deflateEnabled = coerceOptionalBooleanOrCheckboxValueToBoolean(
      val.deflateEnabled
    )

    if (typeof val.gzipLevel === 'undefined') {
      val.gzipLevel = GZIP_LEVEL_RANGE.def
    }
    val.gzipEnabled = coerceOptionalBooleanOrCheckboxValueToBoolean(
      val.gzipEnabled
    )

    if (typeof val.brotliLevel === 'undefined') {
      val.brotliLevel = BROTLI_LEVEL_RANGE.def
    }
    val.brotliEnabled = coerceOptionalBooleanOrCheckboxValueToBoolean(
      val.brotliEnabled
    )

    if (!val.text) {
      val.text = undefined
    }

    return val as SizesRequest
  })
  .superRefine((val, ctx) => {
    const optionValues = [
      val.deflateEnabled,
      val.gzipEnabled,
      val.brotliEnabled,
      val.initialEnabled,
    ]
    if (optionValues.every(b => !b)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        fatal: true,
        message:
          'all measuring options were disabled - at least one must be enabled',
      })
    }
  })

export type SizesRequest = {
  text?: string
  files?: File[]
  initialEnabled: boolean
  deflateEnabled: boolean
  deflateLevel: number
  gzipEnabled: boolean
  gzipLevel: number
  brotliEnabled: boolean
  brotliLevel: number
}

export type SizesRequestErrors = z.inferFlattenedErrors<
  typeof sizesRequestBodySchema
>
