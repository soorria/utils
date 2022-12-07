import { Meta, Title, useRouteData } from 'solid-start'
import { Component, JSXElement } from 'solid-js'
import type { Util } from './all-utils.server'

export enum Tag {
  API = 'API',
  NEEDS_JS = 'NEEDS_JS',
  WIP = 'WIP',
}

export const DEFAULT_TITLE = 'Utils • utils.soorria.com'
export const PLACEHOLDER = '%s'
export const TITLE_FORMAT = `${PLACEHOLDER} • utils.soorria.com`
export const BASE_URL = 'https://utils.soorria.com'
export const OG_IMAGE_BASE = 'https://soorria.com/api/og'
export const ogImage = (title: string = '') =>
  `${OG_IMAGE_BASE}?${new URLSearchParams({
    subtitle: 'utils.soorria.com',
    title,
  })}`

export const CommonMeta = <T extends { utilData: Util }>(): JSXElement => {
  const data = useRouteData<T>()

  const title = () => TITLE_FORMAT.replace(PLACEHOLDER, data.utilData.title)
  const image = () => ogImage(data.utilData.title)

  return (
    <>
      <Title>{title()}</Title>
      <Meta name="description" content={data.utilData.description} />
      <Meta name="image" content={image()} />
      <Meta property="og:url" content={BASE_URL + data.utilData.path} />
      <Meta property="og:type" content="website" />
      <Meta property="og:image" content={image()} />
      <Meta property="og:image:width" content="1200" />
      <Meta property="og:image:height" content="630" />
      <Meta property="og:description" content={data.utilData.description} />
      <Meta property="og:locale" content="en_AU" />
      <Meta name="twitter:card" content="summary_large_image" />
      <Meta name="twitter:creator" content="@soorriously" />
      <Meta name="twitter:site" content="@soorriously" />
      <Meta name="twitter:title" content={title()} />
      <Meta name="twitter:alt" content={title()} />
    </>
  )
}
