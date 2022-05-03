import { cx } from '~/lib/utils'
import { classes } from './styles'

const ResultsSection: React.FC<{ title?: string; utilSlug: string }> = ({
  title = 'your results',
  utilSlug,
  children,
}) => {
  return (
    <div className={cx(classes.root, 'border-success')}>
      <h2 className={cx(classes.title, 'text-success')}>{title}</h2>

      <div className={cx(classes.childrenWrapper)}>{children}</div>

      <p className={cx(classes.footer)}>
        <a
          href={`https://mooth.tech/?ref=Utils&utm_medium=SuccessLink&utm_content=${utilSlug}#contact`}
          target="_blank"
          rel="noopener noreferrer"
          className="hover:underline group focus-outline px-2"
        >
          <span className="underline group-hover:no-underline">Let me know</span> if something looks
          off
        </a>
      </p>
    </div>
  )
}

export default ResultsSection
