import { ParentComponent } from 'solid-js'
import { cx } from '~/lib/utils'

interface SubmitButtonProps {
  isSubmitting?: boolean
  className?: string
}

const SubmitButton: ParentComponent<SubmitButtonProps> = props => {
  return (
    <button
      type="submit"
      class={cx('btn btn-primary btn-block', props.className)}
      classList={{
        loading: props.isSubmitting,
      }}
      disabled={props.isSubmitting}
    >
      {props.children}
    </button>
  )
}

export default SubmitButton
