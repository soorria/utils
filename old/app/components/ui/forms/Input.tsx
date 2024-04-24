import { forwardRef, InputHTMLAttributes } from 'react'
import { cx } from '~/lib/utils'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: boolean
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, error = false, ...props }, ref) => {
    return (
      <input
        className={cx('input', error ? 'input-error' : 'input-primary', className)}
        aria-invalid={error}
        {...props}
        ref={ref}
      />
    )
  }
)

export default Input
