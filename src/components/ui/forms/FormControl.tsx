import { ComponentProps, mergeProps, ParentComponent } from 'solid-js'
import { cx } from '~/lib/utils'

interface FormControlProps extends ComponentProps<'div'> {
  variant?: 'DEFAULT' | 'INLINE' | 'NONE'
}

const variantToClassname: Partial<
  Record<Exclude<FormControlProps['variant'], undefined>, string>
> = {
  DEFAULT: 'space-y-3',
  INLINE: 'flex-row items-center',
}

const FormControl: ParentComponent<FormControlProps> = _props => {
  const props = mergeProps({ variant: 'DEFAULT' as const }, _props)
  return (
    <div
      class={cx('form-control', variantToClassname[props.variant], props.class)}
      {...props}
    >
      {props.children}
    </div>
  )
}

export default FormControl
