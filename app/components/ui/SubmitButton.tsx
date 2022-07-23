import { cx } from '~/lib/utils'

interface SubmitButtonProps {
  isLoading?: boolean
  className?: string
}

const SubmitButton: React.FC<SubmitButtonProps> = ({ isLoading, children, className }) => {
  return (
    <button
      type="submit"
      className={cx('btn btn-primary btn-block', isLoading && 'loading', className)}
      disabled={isLoading}
    >
      {children}
    </button>
  )
}

export default SubmitButton
