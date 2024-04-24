export type CompressionLevelRange = { min: number; max: number; def?: number }

export const BROTLI_LEVEL_RANGE: CompressionLevelRange = {
  min: 0,
  max: 11,
}
export const GZIP_LEVEL_RANGE: CompressionLevelRange = {
  min: 0,
  max: 9,
}
export const DEFLATE_LEVEL_RANGE: CompressionLevelRange = {
  min: 0,
  max: 9,
  def: 9,
}

export const getCompressionRangeDefault = (range: CompressionLevelRange) =>
  range.def ?? range.max

export type { SizesRequest, SizesRequestErrors } from './sizes.server'
