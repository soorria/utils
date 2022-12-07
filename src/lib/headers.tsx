import { HttpHeader } from 'solid-start/server'

export const CdnCacheYear = () => (
  <HttpHeader name="Cache-Control" value="public, s-maxage=31536000" />
)
