import { forwardRef } from 'react'
import { Form, FormProps } from 'remix'
import { cx } from '~/lib/utils'

interface BaseFormProps extends FormProps {
  baseStyles?: boolean
}

const BaseForm = forwardRef<HTMLFormElement, BaseFormProps>(
  ({ baseStyles = true, ...props }, ref) => {
    return (
      <Form
        replace
        {...props}
        className={cx(baseStyles && 'space-y-6', props.className)}
        ref={ref}
      />
    )
  }
)

export default BaseForm
