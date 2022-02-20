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
