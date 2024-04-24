import type { HeadersFunction } from '@remix-run/node'

export const passthroughCachingHeaderFactory =
  (): HeadersFunction =>
  ({ loaderHeaders }) => {
    const caching = loaderHeaders.get('Cache-Control')
    if (caching) return { 'Cache-Control': caching }
    return {} as HeadersInit
  }
