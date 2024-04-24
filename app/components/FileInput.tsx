import { ExclamationCircleIcon } from '@heroicons/react/24/outline'
import { InputHTMLAttributes, useCallback, useEffect, useRef } from 'react'
import {
  type Accept,
  type FileRejection,
  useDropzone,
} from 'react-dropzone-esm'
import { cx, humanFileSize } from '~/lib/utils'
import FormLabel from './ui/forms/FormLabel'

const useStableFunction = <TFunc extends (...args: never[]) => unknown>(
  fn: TFunc
): TFunc => {
  const fnRef = useRef<TFunc>(fn)
  useEffect(() => {
    fnRef.current = fn
  }, [fn])
  return useCallback((...args: never[]) => {
    return fnRef.current(...args)
  }, []) as TFunc
}

const noop = () => {}

const FileInput = ({
  onFiles = noop,
  onError = noop,
  itemsName,
  maxSize,
  ...props
}: Omit<InputHTMLAttributes<HTMLInputElement>, 'onError'> & {
  onFiles?: (files: File[]) => void
  onError?: (files: FileRejection[]) => void
  id: string
  itemsName: string
  maxSize?: number
}) => {
  const onFilesStable = useStableFunction(onFiles)
  const onErrorStable = useStableFunction(onError)

  const onDrop = useCallback((accepted: File[], rejected: FileRejection[]) => {
    onFilesStable(accepted)
    if (rejected.length) {
      onErrorStable(rejected)
    }
  }, [])

  const { getInputProps, getRootProps, isDragActive, acceptedFiles } =
    useDropzone({
      noKeyboard: false,
      noClick: true,
      onDrop,
      disabled: props.disabled,
      multiple: props.multiple,
      maxSize,
      accept: props.accept as unknown as Accept,
    })

  const isDragging = isDragActive
  const hasFiles = acceptedFiles.length > 0

  const totalSize = acceptedFiles
    .map(file => file.size)
    .reduce((acc, curr) => acc + curr, 0)

  return (
    <div
      {...getRootProps({
        className: cx(
          'relative border-2 rounded-btn min-h-[8rem] p-4 text-lg overflow-hidden cursor-default',
          'focus-within-outline',
          isDragging && 'bg-base-200',
          props.disabled ? 'bg-base-200 border-base-200' : 'border-primary'
        ),
      })}
    >
      {!hasFiles ? (
        <label
          htmlFor={props.id}
          className="col-span-full font-semibold place-items-center h-full grid absolute inset-0 cursor-pointer"
        >
          upload {itemsName}
        </label>
      ) : null}

      {hasFiles ? (
        <span className="block space-y-4">
          <span className="font-bold">selected files</span>
          <div className="overflow-x-auto">
            <table className="table w-full table-compact md:table-normal overflow-x-auto">
              <thead>
                <tr>
                  <th>filename</th>
                  <th>type</th>
                  {Boolean(maxSize) && <th>Size</th>}
                </tr>
              </thead>
              <tbody className="text-base">
                {acceptedFiles.map((file, i) => (
                  <tr key={i}>
                    <td className="break-words break-all">{file.name}</td>
                    <td>{file.type}</td>
                    {maxSize ? (
                      <td
                        className={cx(
                          file.size >= maxSize && 'text-error',
                          'flex items-center'
                        )}
                      >
                        {file.size >= maxSize && (
                          <ExclamationCircleIcon className="w-4 h-4 inline-block" />
                        )}
                        {humanFileSize(file.size)}
                        {file.size >= maxSize && ' (file may be too large)'}
                      </td>
                    ) : null}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {maxSize ? (
            <div
              className={cx(
                'text-center font-semibold bg-base-100',
                totalSize >= maxSize && 'text-error'
              )}
            >
              <p>{humanFileSize(totalSize)} total file size</p>
              {totalSize >= maxSize && (
                <p>
                  <ExclamationCircleIcon className="w-5 h-5 inline-block mr-1 mb-1" />
                  <span>files are collectively too large</span>
                </p>
              )}
            </div>
          ) : null}

          <label
            htmlFor={props.id}
            className="cursor-pointer font-semibold text-sm text-center block hocus:underline"
          >
            click to change files to measure
          </label>
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
    </div>
  )
}

export default FileInput

export const FileSizeInfo = ({
  id,
  maxSize,
}: {
  id: string
  maxSize: number
}) => {
  return (
    <FormLabel variant="ALT" id={id}>
      Any file <em>should</em> work. Total file size limited to about{' '}
      {humanFileSize(maxSize)}. App may explode (idk why) or not work as
      expected (vercel payload limits) if the payload is too large.
    </FormLabel>
  )
}
