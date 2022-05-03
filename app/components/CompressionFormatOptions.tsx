import { CompressionLevelRange, getCompressionRangeDefault } from '~/lib/sizes'
import { range } from '~/lib/utils'

interface CompressionFormatToggleProps {
  formatName: string
  id: string
  name: string
}

export const CompressionFormatToggle: React.FC<CompressionFormatToggleProps> = ({
  id,
  formatName,
  name,
}) => {
  return (
    <div className="form-control flex-row items-center">
      <label className="label cursor-pointer text-xl flex-1" htmlFor={id}>
        include {formatName}
      </label>
      <input type="checkbox" className="toggle toggle-primary" defaultChecked id={id} name={name} />
    </div>
  )
}

interface CompressionFormatOptionsProps {
  formatName: string
  idBase: string
  levelRange: CompressionLevelRange
  toggleName: string
  levelName: string
}

const CompressionFormatOptions: React.FC<CompressionFormatOptionsProps> = ({
  idBase,
  formatName,
  levelName,
  levelRange,
  toggleName,
}) => {
  const toggleId = idBase + '-enabled'
  const levelId = idBase + '-level'

  return (
    <div className="space-y-4">
      <CompressionFormatToggle id={toggleId} name={toggleName} formatName={formatName} />

      <div className="space-y-4 form-control">
        <label className="label text-xl" htmlFor={levelId}>
          {formatName} compression level
        </label>
        <input
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
            <span key={i}>{i}</span>
          ))}
        </div>
      </div>
    </div>
  )
}

export default CompressionFormatOptions
