import { ComponentProps, JSX, splitProps, VoidComponent } from 'solid-js'
import { cx } from '~/lib/utils'

interface TextareaProps extends Omit<ComponentProps<'textarea'>, 'style'> {
  autosize?: boolean
  minHeight?: JSX.CSSProperties['min-height']
  style?: JSX.CSSProperties
  error?: boolean
}

const Textarea: VoidComponent<TextareaProps> = props => {
  const [local, delegated] = splitProps(props, [
    'class',
    'style',
    'minHeight',
    'error',
    'autosize',
  ])

  return (
    <textarea
      class={cx(
        'textarea',
        local.error ? 'textarea-error' : 'textarea-primary',
        local.class
      )}
      classList={{
        'textarea-error': local.error,
        'textarea-primary': !local.error,
      }}
      aria-invalid={local.error}
      style={{ 'min-height': local.minHeight }}
      {...delegated}
    />
  )
}

export default Textarea
