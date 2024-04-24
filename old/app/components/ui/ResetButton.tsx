import { Link, LinkProps } from '@remix-run/react'
import { ReactNode } from 'react'
import { cx } from '~/lib/utils'

interface ResetButtonProps {
  onClick?: LinkProps['onClick']
  isLoading?: boolean
  resetHref?: string
  children?: ReactNode
}

const ResetButton = ({
  onClick,
  isLoading,
  resetHref = '.',
  children = 'start over',
}: ResetButtonProps) => {
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
