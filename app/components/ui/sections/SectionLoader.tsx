import { cx } from '~/lib/utils'
import type { SectionVariant } from './common-types'
import { classes, getRootClassForVariant } from './styles'
import { ReactNode } from 'react'

interface SectionLoaderProps {
  variant?: SectionVariant
  children: ReactNode
}

const SectionLoader = ({
  variant = 'DEFAULT',
  children,
}: SectionLoaderProps) => {
  return (
    <div className={cx(getRootClassForVariant(variant), 'border-neutral')}>
      <p className={cx(classes.title, 'skeleton w-64 h-[1.2em]')} />

      <div className={cx(classes.childrenWrapper)}>{children}</div>

      <p className={cx(classes.footer)}>
        <span className="w-56 inline-block h-[1em] skeleton"></span>
      </p>
    </div>
  )
}

export default SectionLoader
