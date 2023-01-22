import zlib from 'zlib'
import { promisify } from 'util'
import { Readable, PassThrough } from 'stream'

import { getResolvedPromiseValueOrDefault } from './utils'
import {
  BROTLI_LEVEL_RANGE,
  CompressionLevelRange,
  DEFLATE_LEVEL_RANGE,
  getCompressionRangeDefault,
  GZIP_LEVEL_RANGE,
} from './sizes'
import { z } from 'zod'
import { optionalBooleanOrCheckboxValue as defaultedBooleanOrCheckboxValue } from './zod-utils'
import { Blob } from 'buffer'
import { File } from 'undici'

export type SizeFormats = 'initial' | 'gzip' | 'brotli' | 'deflate'
export type SizesResult = Partial<Record<SizeFormats, number>>
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

let i = 0

export const getSizes = async (
  stringOrFile: string | File,
  options: SizesOptions
): Promise<SizesResult> => {
  const start = process.hrtime()
  const key = `sizes ${++i}`
  console.log(key, start)
  const logThen =
    <T>(format: SizeFormats) =>
    (r: T): T => {
      console.log(key, format, process.hrtime(start), r)
      return r
    }

  const text =
    typeof stringOrFile === 'string' ? stringOrFile : await stringOrFile.text()

  const resultEntries = (
    await Promise.all([
      getSizeWithKeyAndOptions(
        'initial',
        getSizeIfEnabled(bytesSize, text, options.initialEnabled, -1)
      ).then(logThen('initial')),
      getSizeWithKeyAndOptions(
        'deflate',
        getSizeIfEnabled(
          deflateSize,
          text,
          options.deflateEnabled,
          options.deflateLevel
        )
      ).then(logThen('deflate')),
      getSizeWithKeyAndOptions(
        'gzip',
        getSizeIfEnabled(gzipSize, text, options.gzipEnabled, options.gzipLevel)
      ).then(logThen('gzip')),
      getSizeWithKeyAndOptions(
        'brotli',
        getSizeIfEnabled(
          brotliSize,
          text,
          options.brotliEnabled,
          options.brotliLevel
        )
      ).then(logThen('brotli')),
    ])
  ).filter(([_, val]) => val !== null)

  return Object.fromEntries(resultEntries) as SizesResult
}

const createStringStream = (string: string): Readable => {
  const stream = new Readable()
  stream.push(string)
  stream.push(null)
  return stream
}

export const getSizesUsingStream = async (
  stringOrFile: string | File
): Promise<SizesResult> => {
  const stream = (
    typeof stringOrFile === 'string'
      ? createStringStream(stringOrFile)
      : stringOrFile.stream()
  ) as any

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
  text?: SizesResult
  total?: SizesResult
  files: Record<string, SizesResult>
}

export const getAllSizes = async (
  { text, files = [] }: GetAllSizesInput,
  options: SizesOptions
): Promise<GetAllSizesResult> => {
  const start = process.hrtime()
  console.log('sizes start', start)
  if (typeof text !== 'string' && files.length === 0) {
    return { files: {}, total: options.totalEnabled ? sumSizes([]) : undefined }
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

  console.log('sizes before Promise.all', process.hrtime(start))
  await Promise.all(promises)
  console.log('sizes after Promise.all', process.hrtime(start))

  if (options.totalEnabled) {
    const allSizes = Object.values(result.files)
    if (result.text) {
      allSizes.push(result.text)
    }
    result.total = sumSizes(allSizes)
  }

  return result
}

const sumSizes = (sizes: SizesResult[]): SizesResult => {
  if (sizes.length === 0) {
    return { brotli: 0, deflate: 0, gzip: 0, initial: 0 }
  }

  const keys = Object.keys(sizes[0]!) as (keyof SizesResult)[]
  const result = Object.fromEntries(keys.map(key => [key, 0])) as SizesResult
  for (const measurement of sizes) {
    for (const key of keys) {
      result[key]! += measurement[key] ?? 0
    }
  }

  return result
}

const stringToIntInRange = (range: CompressionLevelRange) =>
  z
    .string()
    .regex(/^\d+$/)
    .transform(val => parseInt(val))
    .refine(
      val => Number.isSafeInteger(val) && val >= range.min && val <= range.max,
      {
        message: `must be between ${range.min} and ${range.max}, inclusive`,
      }
    )

export const sizesRequestBodySchema = z
  .object({
    text: z.string(),
    files: z
      .instanceof(Blob)
      .array()
      .transform(
        files =>
          files.filter(
            file => Boolean((file as File)?.name) && file.size <= 5_000_000
          ) as unknown as File[]
      ),
    initialEnabled: defaultedBooleanOrCheckboxValue(true),
    totalEnabled: defaultedBooleanOrCheckboxValue(true),
    brotliEnabled: defaultedBooleanOrCheckboxValue(true),
    brotliLevel: stringToIntInRange(BROTLI_LEVEL_RANGE),
    gzipEnabled: defaultedBooleanOrCheckboxValue(true),
    gzipLevel: stringToIntInRange(GZIP_LEVEL_RANGE),
    deflateEnabled: defaultedBooleanOrCheckboxValue(true),
    deflateLevel: stringToIntInRange(DEFLATE_LEVEL_RANGE),

    _isFromApi: z.boolean(),
  })
  .partial()
  .superRefine((val, ctx) => {
    if (!val.text && !val.files?.length) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        fatal: true,
        message: 'you must provide at least one of text or files',
      })
    }

    const optionKeys = [
      'deflateEnabled',
      'gzipEnabled',
      'brotliEnabled',
      'initialEnabled',
    ] as const
    if (optionKeys.every(k => !val[k])) {
      if (val._isFromApi) {
        optionKeys.forEach(k => (val[k] = true))
      } else {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          fatal: true,
          message:
            'all measuring options were disabled - at least one must be enabled',
        })
      }
    }
    delete val._isFromApi
  })
  .transform(val => {
    if (typeof val.deflateLevel === 'undefined') {
      val.deflateLevel = getCompressionRangeDefault(DEFLATE_LEVEL_RANGE)
    }

    if (typeof val.gzipLevel === 'undefined') {
      val.gzipLevel = getCompressionRangeDefault(GZIP_LEVEL_RANGE)
    }

    if (typeof val.brotliLevel === 'undefined') {
      val.brotliLevel = getCompressionRangeDefault(BROTLI_LEVEL_RANGE)
    }

    if (!val.text) {
      val.text = undefined
    }

    return val as SizesRequest
  })

export type SizesRequest = {
  text?: string
  files?: File[]
  initialEnabled: boolean
  totalEnabled: boolean
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
