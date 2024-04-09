import { ReactNode } from 'react'
import { cx } from '~/lib/utils'

interface SubmitButtonProps {
  isLoading?: boolean
  className?: string
  children: ReactNode
}

const SubmitButton = ({
  isLoading,
  children,
  className,
}: SubmitButtonProps) => {
  return (
    <button
      type="submit"
      className={cx(
        'btn btn-primary btn-block',
        isLoading && 'loading',
        className
      )}
      disabled={isLoading}
    >
      {children}
    </button>
  )
}

export default SubmitButton
