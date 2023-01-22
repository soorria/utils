import { Component, ComponentProps, Show, splitProps } from 'solid-js'
import { cx } from '~/lib/utils'
import RequiredIndicator from './RequiredIndicator'

interface FormLabelProps extends ComponentProps<'label'> {
  variant?: 'DEFAULT' | 'ALT'
  required?: boolean
}

const FormLabel: Component<FormLabelProps> = props => {
  const [, delegated] = splitProps(props, [
    'variant',
    'required',
    'class',
    'children',
  ])
  return (
    <label {...delegated} class={cx('label', props.class)}>
      <span
        class={props.variant === 'DEFAULT' ? 'label-text' : 'label-text-alt'}
      >
        {props.children}
        <Show when={props.required}>
          <RequiredIndicator />
        </Show>
      </span>
    </label>
  )
}

export default FormLabel
