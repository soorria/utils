import zlib from 'zlib'
import { promisify } from 'util'
import { Readable, PassThrough } from 'stream'

import brotliSize, { stream as brotliStream } from 'brotli-size'

export type SizeFormats = 'initial' | 'gzip' | 'brotli' | 'deflate'
export type Sizes = Record<SizeFormats, number>

export const getSizes = async (stringOrFile: string | File): Promise<Sizes> => {
  const text =
    typeof stringOrFile === 'string' ? stringOrFile : await stringOrFile.text()

  const [gzip, brotli, deflate] = (
    await Promise.allSettled([
      gzipSize(text),
      brotliSize(text),
      deflateSize(text),
    ])
  ).map(result => (result.status === 'fulfilled' ? result.value : -1))

  return {
    initial: bytesSize(text),
    gzip,
    brotli,
    deflate,
  }
}

const hasErrors = (sizes: Sizes) => Object.values(sizes).some(s => s < 0)

const createStringStream = (string: string): Readable => {
  const stream = new Readable()
  stream.push(string)
  stream.push(null)
  return stream
}

type StreamToMeasure = Readable | NodeJS.ReadableStream
type SizeFromStream = (stream: StreamToMeasure) => Promise<number>

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
  ).map(result => (result.status === 'fulfilled' ? result.value : -1))

  return {
    initial,
    gzip,
    brotli,
    deflate,
  }
}

const bytesSize = (text: string): number => {
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
const deflateSize = async (text: string): Promise<number> => {
  const compressed = await deflate(text)
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
const gzipSize = async (text: string): Promise<number> => {
  const compressed = await gzip(text, { level: 9 })
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

const brotliSizeFromStream: SizeFromStream = stream => {
  const brotli = brotliStream()

  return new Promise(resolve => {
    brotli.on('brotli-size' as any, resolve).on('error', err => {
      console.log({ err })
      resolve(-1)
    })
    stream.pipe(brotli)
  })
}

export type GetAllSizesInput = {
  text?: string | null
  files?: Record<string, File>
}

export type GetAllSizesResult = {
  text?: Sizes
  files: Record<string, Sizes>
}

export const getAllSizes = async ({
  text,
  files = {},
}: GetAllSizesInput): Promise<GetAllSizesResult> => {
  const filesEntries = Object.entries(files)

  if (typeof text !== 'string' && filesEntries.length === 0) {
    return { files: {} }
  }

  const promises: Promise<void>[] = []
  const result: GetAllSizesResult = { files: {} }

  if (typeof text === 'string') {
    promises.push(
      getSizes(text).then(sizes => {
        result.text = sizes
      })
    )
  }

  if (filesEntries.length) {
    filesEntries.forEach(([name, file]) => {
      promises.push(
        getSizes(file).then(sizes => {
          result.files![name] = sizes
        })
      )
    })
  }

  await Promise.all(promises)

  return result
}
