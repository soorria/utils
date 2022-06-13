import { cx } from '~/lib/utils'
import { classes } from './styles'

const ErrorSection: React.FC<{ title?: string; utilSlug: string }> = ({
  title = 'something went wrong :(',
  utilSlug,
  children,
}) => {
  return (
    <div className={cx(classes.root, 'border-error')}>
      <h2 className={cx(classes.title, 'text-error')}>{title}</h2>

      <div className={cx(classes.childrenWrapper)}>{children}</div>

      <p className={cx(classes.footer)}>
        <a
          href={`https://soorria.com/?ref=Utils&utm_medium=ErrorLink&utm_content=${utilSlug}#contact`}
          target="_blank"
          rel="noopener noreferrer"
          className="hover:underline group focus-outline px-2"
        >
          If this is unexpected,{' '}
          <span className="underline group-hover:no-underline">let me know</span> what happened.
        </a>
      </p>
    </div>
  )
}

export default ErrorSection
