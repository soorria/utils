import { cx } from '~/lib/utils'

interface SubmitButtonProps {
  isLoading?: boolean
}

const SubmitButton: React.FC<SubmitButtonProps> = ({ isLoading, children }) => {
  return (
    <button
      type="submit"
      className={cx('btn btn-primary btn-block', isLoading && 'loading')}
      disabled={isLoading}
    >
      {children}
    </button>
  )
}

export default SubmitButton
