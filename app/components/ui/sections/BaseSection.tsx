import type { HTMLAttributes, ReactNode } from 'react'
import { cx } from '~/lib/utils'
import type { SectionVariant } from './common-types'
import { classes, getRootClassForVariant } from './styles'

const BaseSection = ({
  title,
  className,
  children,
  variant = 'DEFAULT',
  ...props
}: { title?: ReactNode; variant?: SectionVariant } & Omit<
  HTMLAttributes<HTMLDivElement>,
  'title'
>) => {
  return (
    <div className={cx(getRootClassForVariant(variant), className)} {...props}>
      {title && <h2 className={cx(classes.title, 'text-primary')}>{title}</h2>}

      <div className={cx(classes.childrenWrapper)}>{children}</div>
    </div>
  )
}

export default BaseSection
