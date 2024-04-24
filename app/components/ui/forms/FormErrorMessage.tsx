import { forwardRef, HTMLAttributes } from 'react'
import { cx } from '~/lib/utils'

interface FormErrorMessageProps extends HTMLAttributes<HTMLParagraphElement> {}

const FormErrorMessage = forwardRef<HTMLParagraphElement, FormErrorMessageProps>(
  ({ className, ...props }, ref) => {
    return (
      <p
        className={cx('label-text-alt text-error', className)}
        aria-live="polite"
        {...props}
        ref={ref}
      />
    )
  }
)

export default FormErrorMessage
