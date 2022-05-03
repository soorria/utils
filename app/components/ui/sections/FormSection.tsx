import { cx } from '~/lib/utils'
import { classes } from './styles'

const FormSection: React.FC<{ title?: string }> = ({ title = 'your results', children }) => {
  return (
    <div className={cx(classes.root, 'border-neutral')}>
      {title && <h2 className={cx(classes.title, 'text-primary')}>{title}</h2>}

      <div className={cx(classes.childrenWrapper)}>{children}</div>
    </div>
  )
}

export default FormSection
