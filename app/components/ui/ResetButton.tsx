import { Link, LinkProps } from 'remix'
import { cx } from '~/lib/utils'

interface ResetButtonProps {
  onClick?: LinkProps['onClick']
  isLoading?: boolean
  resetHref?: string
}

const ResetButton: React.FC<ResetButtonProps> = ({
  onClick,
  isLoading,
  resetHref = '.',
  children = 'start over',
}) => {
  return (
    <Link
      to={resetHref}
      className={cx('btn btn-ghost btn-block', isLoading && 'btn-disabled')}
      onClick={onClick}
    >
      {children}
    </Link>
  )
}

export default ResetButton
