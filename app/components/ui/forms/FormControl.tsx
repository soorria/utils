import { forwardRef, HTMLAttributes } from 'react'
import { cx } from '~/lib/utils'

interface FormControlProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'DEFAULT' | 'INLINE' | 'NONE'
}

const variantToClassname: Partial<Record<Exclude<FormControlProps['variant'], undefined>, string>> =
  {
    DEFAULT: 'space-y-3',
    INLINE: 'flex-row items-center',
  }

const FormControl = forwardRef<HTMLDivElement, FormControlProps>(
  ({ children, className, variant = 'DEFAULT', ...props }, ref) => {
    return (
      <div
        className={cx('form-control', variantToClassname[variant], className)}
        {...props}
        ref={ref}
      >
        {children}
      </div>
    )
  }
)

export default FormControl
