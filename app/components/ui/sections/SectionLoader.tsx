import { cx } from '~/lib/utils'
import type { SectionVariant } from './common-types'
import { classes, getRootClassForVariant } from './styles'

interface SectionLoaderProps {
  variant?: SectionVariant
}

const SectionLoader: React.FC<SectionLoaderProps> = ({ variant = 'DEFAULT', children }) => {
  return (
    <div className={cx(getRootClassForVariant(variant), 'border-neutral')}>
      <h2 className={cx(classes.title, 'skeleton w-64 h-[1.2em]')} />

      <div className={cx(classes.childrenWrapper)}>{children}</div>

      <p className={cx(classes.footer)}>
        <span className="w-56 inline-block h-[1em] skeleton"></span>
      </p>
    </div>
  )
}

export default SectionLoader
