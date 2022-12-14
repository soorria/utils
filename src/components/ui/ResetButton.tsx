import { ComponentProps, ParentComponent } from 'solid-js'
import { A } from 'solid-start'

interface ResetButtonProps {
  onClick?: ComponentProps<typeof A>['onClick']
  isSubmitting?: boolean
  resetHref: string
}

const ResetButton: ParentComponent<ResetButtonProps> = props => {
  return (
    <A
      href={props.resetHref}
      class={'btn btn-ghost btn-block'}
      classList={{
        'btn-disabled': props.isSubmitting,
      }}
      onClick={props.onClick}
    >
      {props.children}
    </A>
  )
}

export default ResetButton
