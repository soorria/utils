import { cx } from '~/lib/utils'
import { classes } from './styles'

interface SectionLoaderProps {}

const SectionLoader: React.FC<SectionLoaderProps> = () => {
  return (
    <div className={cx(classes.root, 'border-neutral')}>
      <h2 className={cx(classes.title, 'bg-neutral w-64 animate-pulse h-[1em]')} />

      <div className={cx(classes.childrenWrapper)} />

      <p className={cx(classes.footer)}>
        <span className="w-56 inline-block h-[1em] animate-pulse bg-neutral"></span>
      </p>
    </div>
  )
}

export default SectionLoader
