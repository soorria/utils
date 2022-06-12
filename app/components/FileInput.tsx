import { InputHTMLAttributes, useCallback, useEffect, useRef } from 'react'
import { useDropzone } from 'react-dropzone'
import { cx } from '~/lib/utils'

const FileInput: React.FC<
  InputHTMLAttributes<HTMLInputElement> & { onFiles?: (files: File[]) => any }
> = ({ onFiles, ...props }) => {
  const onFilesRef = useRef<typeof onFiles>()

  useEffect(() => {
    onFilesRef.current = onFiles
  }, [onFiles])

  const onDrop = useCallback(files => {
    onFilesRef.current?.(files)
  }, [])

  const { getInputProps, getRootProps, isDragActive, acceptedFiles } = useDropzone({
    noKeyboard: false,
    noClick: true,
    onDrop,
    disabled: props.disabled,
  })

  const isDragging = isDragActive
  const hasFiles = acceptedFiles.length > 0

  return (
    <label
      {...getRootProps({
        className: cx(
          'relative border-2 rounded-btn min-h-[8rem] p-4 text-lg font-semibold overflow-hidden group',
          'focus-within-outline',
          isDragging && 'bg-base-200',
          props.disabled ? 'bg-base-200 border-base-200' : 'border-primary'
        ),
      })}
    >
      {!hasFiles ? (
        <span className="col-span-full place-items-center h-full grid absolute inset-0">
          upload files to measure
        </span>
      ) : null}

      {hasFiles ? (
        <span className="block space-y-4">
          <span>selected files</span>
          <table className="table w-full table-compact md:table-normal">
            <thead>
              <tr>
                <th>filename</th>
                <th>type</th>
              </tr>
            </thead>
            <tbody className="text-base">
              {acceptedFiles.map((file, i) => (
                <tr key={i}>
                  <td>{file.name}</td>
                  <td>{file.type}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <span className="text-sm text-center block group-hover:underline">
            click to change files to measure
          </span>
        </span>
      ) : null}

      <input
        {...getInputProps({
          name: 'file',
          type: 'file',
          className:
            'sr-only no-js:not-sr-only input input-primary border-none focus:outline-none block',
          ...props,
        })}
      />

      <span
        className={cx(
          'place-items-center bg-base-200 absolute inset-0 transition-opacity pointer-events-none grid col-span-full z-50',
          isDragging ? 'opacity-100' : 'opacity-0'
        )}
      >
        drop files to measure
      </span>

      {/* Janky workaround for when ther's no js so that you can still see if you've selected any files */}
      <noscript>
        <style>{`.no-js\\:not-sr-only{position:static;width:auto;height:auto;padding:0;margin:0;overflow:visible;clip:auto;white-space:normal;display:block!important;margin:0 auto;}`}</style>
      </noscript>
    </label>
  )
}

export default FileInput
