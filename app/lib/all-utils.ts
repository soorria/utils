import type { MetaFunction } from '@remix-run/node'
import type { Util } from './all-utils.server'
import { V1_MetaDescriptor, metaV1 } from '@remix-run/v1-meta'

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

export const commonMetaFactory =
  <LoaderData extends { utilData: Util }>(overrides?: V1_MetaDescriptor) =>
  (
    args: Omit<Parameters<MetaFunction>[0], 'data'> & {
      data: LoaderData
    }
  ) => {
    const title = TITLE_FORMAT.replace(PLACEHOLDER, args.data.utilData.title)
    const { description, path } = args.data.utilData

    const image = ogImage(args.data.utilData.title)

    return metaV1(args, {
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
      ...overrides,
    })
  }
