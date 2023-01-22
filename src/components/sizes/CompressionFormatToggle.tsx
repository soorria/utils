import { Component } from 'solid-js'
import FormControl from '../ui/forms/FormControl'

interface CompressionFormatToggleProps {
  formatName: string
  id: string
  name: string
}

const CompressionFormatToggle: Component<
  CompressionFormatToggleProps
> = props => {
  return (
    <FormControl variant="INLINE">
      <label class="cursor-pointer flex-1" for={props.id}>
        Include {props.formatName}
      </label>
      <input
        type="checkbox"
        class="toggle toggle-primary"
        checked={true}
        id={props.id}
        name={props.name}
      />
    </FormControl>
  )
}

export default CompressionFormatToggle
