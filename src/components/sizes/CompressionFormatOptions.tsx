import { Component, For } from 'solid-js'
import { CompressionLevelRange, getCompressionRangeDefault } from '~/lib/sizes'
import { range } from '~/lib/utils'
import FormControl from '../ui/forms/FormControl'
import FormLabel from '../ui/forms/FormLabel'
import CompressionFormatToggle from './CompressionFormatToggle'

interface CompressionFormatOptionsProps {
  formatName: string
  idBase: string
  levelRange: CompressionLevelRange
  toggleName: string
  levelName: string
}

const CompressionFormatOptions: Component<
  CompressionFormatOptionsProps
> = props => {
  const toggleId = () => props.idBase + '-enabled'
  const levelId = () => props.idBase + '-level'
  const label = () => `${props.formatName} compression level`

  let inputRef: HTMLInputElement | undefined

  return (
    <div class="space-y-4">
      <CompressionFormatToggle
        id={toggleId()}
        name={props.toggleName}
        formatName={props.formatName}
      />

      <FormControl>
        <FormLabel for={levelId()}>{label}</FormLabel>
        <input
          ref={inputRef}
          type="range"
          min={props.levelRange.min}
          max={props.levelRange.max}
          // TODO
          // defaultValue={getCompressionRangeDefault(props.levelRange)}
          attr:value={getCompressionRangeDefault(props.levelRange)}
          class="range range-primary focus-outline"
          id={levelId()}
          name={props.levelName}
        />
        <div class="w-full flex justify-between text-xs px-2">
          <For each={range(props.levelRange.min, props.levelRange.max + 1)}>
            {i => (
              <button
                type="button"
                tabIndex={-1}
                onClick={() => {
                  if (inputRef) inputRef.value = i.toString()
                }}
                aria-label={`set ${label} to ${i} out of ${
                  props.levelRange.max + 1
                }`}
              >
                {i}
              </button>
            )}
          </For>
        </div>
      </FormControl>
    </div>
  )
}

export default CompressionFormatOptions
