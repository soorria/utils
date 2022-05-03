import type { MetaFunction } from 'remix'
import type { Util } from './all-utils.server'

export const DEFAULT_TITLE = 'Utils | mooth.tech'
export const PLACEHOLDER = '%s'
export const TITLE_FORMAT = `${PLACEHOLDER} | ${DEFAULT_TITLE}`
export const BASE_URL = 'https://utils.mooth.tech'
export const OG_IMAGE_BASE = 'https://mooth.tech/api/og'
export const ogImage = (title: string = '') =>
  `${OG_IMAGE_BASE}?${new URLSearchParams({ category: 'utils', title })}`

export const commonMetaFactory =
  <LoaderData extends { utilData: Util }>() =>
  ({
    data,
  }: Omit<Parameters<MetaFunction>[0], 'data'> & {
    data: LoaderData
  }): ReturnType<MetaFunction> => {
    const title = TITLE_FORMAT.replace(PLACEHOLDER, data.utilData.title)
    const { description, path } = data.utilData

    const image = ogImage(data.utilData.title)

    return {
      title,
      description,
      image,
      'og:url': BASE_URL + path,
      'og:type': 'website',
      'og:image': image,
      'og:image:width': '1200',
      'og:image:height': '630',
      'og:description': description,
      'og:locale': 'en_AU',
      'twitter:card': 'summary_large_image',
      'twitter:creator': '@soorriously',
      'twitter:site': '@soorriously',
      'twitter:title': title,
      'twitter:alt': title,
    }
  }
