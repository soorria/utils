import { useRef } from 'react'
import { CompressionLevelRange, getCompressionRangeDefault } from '~/lib/sizes'
import { range } from '~/lib/utils'
import FormControl from './ui/forms/FormControl'
import FormLabel from './ui/forms/FormLabel'

interface CompressionFormatToggleProps {
  formatName: string
  id: string
  name: string
}

export const CompressionFormatToggle = ({
  id,
  formatName,
  name,
}: CompressionFormatToggleProps) => {
  return (
    <FormControl variant="INLINE">
      <FormLabel className="cursor-pointer flex-1" htmlFor={id}>
        include {formatName}
      </FormLabel>
      <input
        type="checkbox"
        className="toggle toggle-primary"
        defaultChecked
        id={id}
        name={name}
      />
    </FormControl>
  )
}

interface CompressionFormatOptionsProps {
  formatName: string
  idBase: string
  levelRange: CompressionLevelRange
  toggleName: string
  levelName: string
}

const CompressionFormatOptions = ({
  idBase,
  formatName,
  levelName,
  levelRange,
  toggleName,
}: CompressionFormatOptionsProps) => {
  const toggleId = idBase + '-enabled'
  const levelId = idBase + '-level'
  const label = `${formatName} compression level`

  const inputRef = useRef<HTMLInputElement>(null)

  return (
    <div className="space-y-4">
      <CompressionFormatToggle
        id={toggleId}
        name={toggleName}
        formatName={formatName}
      />

      <FormControl>
        <FormLabel htmlFor={levelId}>{label}</FormLabel>
        <input
          ref={inputRef}
          type="range"
          min={levelRange.min}
          max={levelRange.max}
          defaultValue={getCompressionRangeDefault(levelRange)}
          className="range range-primary focus-outline"
          id={levelId}
          name={levelName}
        />
        <div className="w-full flex justify-between text-xs px-2">
          {range(levelRange.min, levelRange.max + 1).map(i => (
            <button
              type="button"
              key={i}
              tabIndex={-1}
              onClick={() => {
                const input = inputRef.current
                if (input) input.value = i.toString()
              }}
              aria-label={`set ${label} to ${i} out of ${levelRange.max + 1}`}
            >
              {i}
            </button>
          ))}
        </div>
      </FormControl>
    </div>
  )
}

export default CompressionFormatOptions
