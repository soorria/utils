import zlib from 'zlib'
import { promisify } from 'util'

import brotliSize from 'brotli-size'

export type SizeFormats = 'initial' | 'gzip' | 'brotli'
export type Sizes = Record<SizeFormats, number>

export const getSizes = async (stringOrFile: string | File): Promise<Sizes> => {
  const text =
    typeof stringOrFile === 'string' ? stringOrFile : await stringOrFile.text()

  const [gzip, brotli] = (
    await Promise.allSettled([gzipSize(text), brotliSize(text)])
  ).map(result => (result.status === 'fulfilled' ? result.value : -1))

  return {
    initial: bytesSize(text),
    gzip,
    brotli,
  }
}

const bytesSize = (text: string): number => {
  return new TextEncoder().encode(text).length
}

const gzip = promisify(zlib.gzip)
const gzipSize = async (text: string): Promise<number> => {
  const compressed = await gzip(text, { level: 9 })
  return compressed.length
}

export type GetAllSizesInput = {
  text?: string | null
  files?: Record<string, File>
}

export type GetAllSizesResult = {
  text?: Sizes
  files?: Record<string, Sizes>
}

export const getAllSizes = async ({
  text,
  files = {},
}: GetAllSizesInput): Promise<GetAllSizesResult> => {
  const filesEntries = Object.entries(files)

  if (typeof text !== 'string' && filesEntries.length === 0) {
    return {}
  }

  const promises: Promise<void>[] = []
  const result: GetAllSizesResult = {}

  if (typeof text === 'string') {
    promises.push(
      getSizes(text).then(sizes => {
        result.text = sizes
      })
    )
  }

  if (filesEntries.length) {
    result.files = {}
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
