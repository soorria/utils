import {
  Component,
  ComponentProps,
  mergeProps,
  ParentComponent,
  splitProps,
} from 'solid-js'

interface BaseFormProps extends ComponentProps<'form'> {
  baseStyles?: boolean
  form: Component<any>
}

export const baseFormClass = 'space-y-6'

const BaseForm: ParentComponent<BaseFormProps> = _props => {
  const [local, props] = splitProps(mergeProps({ baseStyles: true }, _props), [
    'baseStyles',
    'form',
  ])

  return <form {...props}></form>
}

export default BaseForm
