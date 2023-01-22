import { Component, ComponentProps, For, Show } from 'solid-js'
import { createDropzone, FileRejection } from '@soorria/solid-dropzone'
import { cx, humanFileSize } from '~/lib/utils'
import { ExclamationTriangleIconSolid } from '../icons'
import FormLabel from './FormLabel'

const FileInput: Component<
  ComponentProps<'input'> & {
    value?: File[]
    onFiles?: (files: File[]) => any
    onError?: (files: FileRejection[]) => any
    id: string
    itemsName: string
    maxSize?: number
  }
> = props => {
  const dropzone = createDropzone({
    noKeyboard: false,
    noClick: true,
    onDrop: (accepted, rejected) => {
      props.onFiles?.(accepted)
      if (rejected.length) {
        console.log('rejected files', rejected, accepted)
        props.onError?.(rejected)
      }
    },
    get disabled() {
      return props.disabled
    },
    get multiple() {
      return props.multiple
    },
    get maxSize() {
      return props.maxSize
    },
    get accept() {
      return props.accept
    },
  })

  const isDragging = () => dropzone.isDragActive
  const hasFiles = () => dropzone.acceptedFiles.length > 0
  const acceptedFiles = () => dropzone.acceptedFiles
  const totalSize = () =>
    dropzone.acceptedFiles
      .map(file => file.size)
      .reduce((acc, curr) => acc + curr, 0)

  return (
    <div
      {...dropzone.getRootProps({
        class: cx(
          'relative border-2 rounded-btn min-h-[8rem] p-4 text-lg overflow-hidden cursor-default',
          'focus-within-outline',
          isDragging() && 'bg-base-200',
          props.disabled ? 'bg-base-200 border-base-200' : 'border-primary'
        ),
      })}
    >
      <Show
        when={hasFiles()}
        fallback={
          <label
            for={props.id}
            class="col-span-full font-semibold place-items-center h-full grid absolute inset-0 cursor-pointer"
          >
            upload {props.itemsName}
          </label>
        }
      >
        <span class="block space-y-4">
          <span class="font-bold">selected files</span>
          <div class="overflow-x-auto">
            <table class="table w-full table-compact md:table-normal overflow-x-auto">
              <thead>
                <tr>
                  <th>filename</th>
                  <th>type</th>
                  <Show when={props.maxSize}>
                    <th>Size</th>
                  </Show>
                </tr>
              </thead>
              <tbody class="text-base">
                <For each={acceptedFiles()}>
                  {file => (
                    <tr>
                      <td class="break-words break-all">{file.name}</td>
                      <td>{file.type}</td>
                      <Show when={props.maxSize} keyed>
                        {maxSize => (
                          <td
                            class={cx(
                              file.size >= maxSize && 'text-error',
                              'flex items-center'
                            )}
                          >
                            {file.size >= maxSize && (
                              <ExclamationTriangleIconSolid class="w-4 h-4 inline-block" />
                            )}
                            {humanFileSize(file.size)}
                            {file.size >= maxSize && ' (file too large)'}
                          </td>
                        )}
                      </Show>
                    </tr>
                  )}
                </For>
              </tbody>
            </table>
          </div>

          <Show when={props.maxSize} keyed>
            {maxSize => (
              <div
                class={cx(
                  'text-center font-semibold bg-base-100',
                  totalSize() >= maxSize && 'text-error'
                )}
              >
                <p>{humanFileSize(totalSize())} total file size</p>
                {totalSize() >= maxSize && (
                  <p>
                    <ExclamationTriangleIconSolid class="w-5 h-5 inline-block mr-1 mb-1" />
                    <span>files are collectively too large</span>
                  </p>
                )}
              </div>
            )}
          </Show>

          <label
            for={props.id}
            class="cursor-pointer font-semibold text-sm text-center block hocus:underline"
          >
            click to change files to measure
          </label>
        </span>
      </Show>

      <input
        {...dropzone.getInputProps({
          name: props.name ?? 'file',
          id: props.id,
          type: 'file',
          class:
            'sr-only no-js:not-sr-only input input-primary border-none focus:outline-none block',
          // ...props,
        })}
      />

      <span
        class="place-items-center bg-base-200 absolute inset-0 transition-opacity pointer-events-none grid col-span-full z-50"
        classList={{
          'opacity-0': !isDragging(),
          'opacity-100': isDragging(),
        }}
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

export const FileSizeInfo: Component<{
  id: string
  maxSize: number
}> = props => {
  return (
    <FormLabel variant="ALT" id={props.id}>
      Any file <em>should</em> work. Total file size limited to about{' '}
      {humanFileSize(props.maxSize)}. App may explode (idk why) or not work as
      expected (vercel payload limits) if the payload is too large.
    </FormLabel>
  )
}
