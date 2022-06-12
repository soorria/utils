import { CSSProperties, forwardRef, TextareaHTMLAttributes } from 'react'
import { cx } from '~/lib/utils'

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  minHeight?: CSSProperties['minHeight']
  error?: boolean
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, minHeight, error, style, ...props }, ref) => {
    return (
      <textarea
        className={cx('textarea', error ? 'textarea-error' : 'textarea-primary', className)}
        aria-invalid={error}
        style={{ minHeight, ...style }}
        {...props}
        ref={ref}
      />
    )
  }
)

export default Textarea
