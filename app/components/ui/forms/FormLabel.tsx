import { forwardRef, LabelHTMLAttributes } from 'react'
import { cx } from '~/lib/utils'
import RequiredIndicator from './RequiredIndicator'

interface FormLabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
  variant?: 'DEFAULT' | 'ALT'
  required?: boolean
}

const FormLabel = forwardRef<HTMLLabelElement, FormLabelProps>(
  ({ className, variant = 'DEFAULT', children, required, ...props }, ref) => {
    return (
      <label {...props} className={cx('label', className)} ref={ref}>
        <span className={variant === 'DEFAULT' ? 'label-text' : 'label-text-alt'}>
          {children}
          {required && <RequiredIndicator />}
        </span>
      </label>
    )
  }
)

export default FormLabel
