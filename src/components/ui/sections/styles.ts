import { cx } from '~/lib/utils'
import type { SectionVariant } from './common-types'

const rootMinimal = 'flex flex-col space-y-8 scroll-m-8'
export const classes = {
  rootMinimal,
  rootBase: cx('p-4 md:p-8 border-2 rounded-box', rootMinimal),
  title: 'text-3xl',
  childrenWrapper: 'space-y-6 flex-1',
  footer: 'text-center text-sm',
} as const

const variantToRootClass: Record<SectionVariant, string> = {
  DEFAULT: classes.rootBase,
  MINIMAL: classes.rootMinimal,
}
export const defaultSectionVariant: SectionVariant = 'DEFAULT'

export const getRootClassForVariant = (variant: SectionVariant) =>
  variantToRootClass[variant]
