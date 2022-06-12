import type { ReactNode } from 'react'
import { cx } from '~/lib/utils'
import { classes } from './styles'

const MinimalSection: React.FC<{ title?: ReactNode; className?: string }> = ({
  title,
  className,
  children,
}) => {
  return (
    <div className={cx(classes.rootMinimal, className)}>
      {title && <h2 className={cx(classes.title, 'text-primary')}>{title}</h2>}

      <div className={cx(classes.childrenWrapper)}>{children}</div>
    </div>
  )
}

export default MinimalSection
