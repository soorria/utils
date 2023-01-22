import {
  ComponentProps,
  mergeProps,
  ParentComponent,
  splitProps,
} from 'solid-js'
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

const FormControl: ParentComponent<FormControlProps> = props => {
  const [local, delegated] = splitProps(props, ['variant', 'class', 'children'])
  return (
    <div
      {...delegated}
      class={cx(
        'form-control',
        variantToClassname[local.variant ?? 'DEFAULT'],
        local.class
      )}
    >
      {local.children}
    </div>
  )
}

export default FormControl
