import {
  CSSProperties,
  forwardRef,
  TextareaHTMLAttributes,
  useEffect,
  useLayoutEffect,
} from 'react'
import { cx } from '~/lib/utils'

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  autosize?: boolean
  minHeight?: CSSProperties['minHeight']
  error?: boolean
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, minHeight, error, style, autosize = false, ...props }, ref) => {
    return (
      <textarea
        className={cx(
          'textarea',
          error ? 'textarea-error' : 'textarea-primary',
          className
        )}
        aria-invalid={error}
        style={{ minHeight, ...style }}
        {...props}
        ref={ref}
      />
    )
  }
)

export default Textarea
