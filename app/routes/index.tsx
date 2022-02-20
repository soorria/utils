import { mapToSourceFile } from '@remix-run/node/errors'
import {
  DragEventHandler,
  FormEvent,
  FormEventHandler,
  InputHTMLAttributes,
  ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react'
import { useDropzone } from 'react-dropzone'
import {
  ActionFunction,
  Form,
  useActionData,
  Link,
  LoaderFunction,
  useLoaderData,
  useTransition,
  json,
  useSubmit,
} from 'remix'
import { getSizes, Sizes } from '~/lib/sizes.server'
import { parseMultipartFormData } from '~/lib/uploads.server'
import { capitalise, cx, randomItem } from '~/lib/utils'

type ActionData =
  | {
      status: 'success'
      text: string | null
      textSizes?: Sizes
      files: Record<string, Sizes>
    }
  | {
      status: 'error'
      error: string
    }

export const action: ActionFunction = async ({
  request,
}): Promise<ActionData> => {
  const formData = await parseMultipartFormData(request)

  await new Promise(r => setTimeout(r, 500))

  if (!formData) {
    return {
      status: 'error',
      error:
        "I couldn't read your submission. Maybe the files your uploaded are too large?",
    }
  }

  const inputText = formData.get('text')
  const inputFiles = formData
    .getAll('files')
    .filter(file => Boolean((file as File).name))

  if (!inputText && inputFiles.length === 0) {
    return {
      status: 'error',
      error: 'At least one of Text and File must be provided',
    }
  }

  let text: string | null = null
  let textSizePromise: Promise<Sizes | undefined>

  if (typeof inputText === 'string' && inputText !== '') {
    textSizePromise = getSizes(inputText)
    text = inputText
  } else {
    textSizePromise = Promise.resolve(undefined)
  }

  const fileSizePromises: Promise<[string, Sizes]>[] = inputFiles.map(
    inputFile =>
      getSizes(inputFile).then(result => [(inputFile as File).name, result])
  )

  const allFileSizesPromise = Promise.all(fileSizePromises).then(entries =>
    Object.fromEntries(entries)
  )
  const [textSizes, files] = await Promise.all([
    textSizePromise,
    allFileSizesPromise,
  ])

  return { status: 'success', text, textSizes, files }
}

type LoaderData = { title: string }

export const loader: LoaderFunction = () => {
  const titles = [
    'character counter',
    'measuring machine',
    'byte counter',
    'measuring tape',
  ]

  return json(
    { title: randomItem(titles) },
    { headers: { 'Cache-Control': 's-max-age=10, public' } }
  )
}

const formatOrder = ['initial', 'gzip', 'brotli'] as const

const ids = {
  formError: 'form-error',
  textarea: 'text',
  fileInput: 'file',
  fileInputHelpText: 'file-help-text',
}

const ResultSection: React.FC<{ title: ReactNode; sizes: Sizes }> = ({
  title,
  sizes,
}) => {
  return (
    <section>
      <h3 className="text-xl mb-4">{title}</h3>

      <table className="table w-full">
        <thead>
          <tr>
            <th>format</th>
            <th>size (bytes)</th>
          </tr>
        </thead>
        <tbody>
          {formatOrder.map(format => (
            <tr key={format} className="hover">
              <td>{capitalise(format)}</td>
              <td>{sizes[format]}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  )
}

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

  const { getInputProps, getRootProps, isDragActive, acceptedFiles } =
    useDropzone({
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
          'relative border-2 rounded-btn outline-none min-h-[8rem] p-4 text-lg font-semibold overflow-hidden group',
          'focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-primary',
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
          <table className="table w-full">
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
            'sr-only form-control input input-primary border-none focus:outline-none block',
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
    </label>
  )
}

const Divider: React.FC = ({ children }) => {
  const line = (
    <div role="presentation" className="flex items-center">
      <div className="h-px bg-neutral-content flex-1" />
    </div>
  )

  return (
    <div
      className="grid gap-4 px-4"
      style={{ gridTemplateColumns: '1fr auto 1fr' }}
    >
      {line}
      <div className="italic text-sm">{children}</div>
      {line}
    </div>
  )
}

export default function Index() {
  const { title } = useLoaderData<LoaderData>()
  const submit = useSubmit()
  const transition = useTransition()
  const actionData = useActionData<ActionData>()
  const [files, setFiles] = useState<File[]>([])

  const titleRef = useRef<HTMLHeadingElement | null>(null)

  const isSuccess = !transition.submission && actionData?.status === 'success'
  const isError = !transition.submission && actionData?.status === 'error'
  const isLoading = Boolean(transition.submission)

  const prevSubmissionRef = useRef<typeof transition.submission>()
  useEffect(() => {
    const submission = transition.submission

    if (prevSubmissionRef.current && !submission) {
      titleRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    prevSubmissionRef.current = submission
  }, [transition.submission])

  // need this since we can't set the value of file inputs with js
  const handleSubmit: FormEventHandler<HTMLFormElement> = event => {
    event.preventDefault()
    const data = new FormData(event.currentTarget)

    const existingFiles = new Set(data.getAll('files'))

    files.forEach(file => {
      if (!existingFiles.has(file)) {
        data.append('files', file)
      }
    })

    submit(data, {
      method: 'post',
      encType: 'multipart/form-data',
      action: '/?index',
    })
  }

  return (
    <main className="space-y-8">
      <h1 ref={titleRef} className="text-5xl mt-8 scroll-mt-8">
        {title}
      </h1>

      {isError ? (
        <div className="space-y-6 p-4 border-error border-2 rounded-btn">
          <h2 className="text-3xl text-error">something went wrong :(</h2>
          <p aria-live="assertive" id={ids.formError}>
            {actionData.error}
          </p>
        </div>
      ) : null}

      {isSuccess ? (
        <div className="space-y-6 p-4 border-success border-2 rounded-btn">
          <h2 className="text-3xl text-success">your results</h2>

          {Object.entries(actionData.files).map(([name, sizes]) => (
            <ResultSection
              key={name}
              title={
                <>
                  sizes for your file: <code>{name}</code>
                </>
              }
              sizes={sizes}
            />
          ))}

          {actionData.textSizes ? (
            <ResultSection
              title="sizes for your text"
              sizes={actionData.textSizes}
            />
          ) : null}
        </div>
      ) : null}

      <Form
        method="post"
        className="space-y-8"
        aria-errormessage={isError ? ids.formError : undefined}
        onSubmit={handleSubmit}
        encType="multipart/form-data"
      >
        <div className="form-control">
          <label className="label text-xl mb-4" htmlFor={ids.fileInput}>
            your file
          </label>
          <FileInput
            id={ids.fileInput}
            name="files"
            aria-describedby={ids.fileInputHelpText}
            disabled={isLoading}
            onFiles={files => setFiles(files)}
          />
          <p id={ids.fileInputHelpText} className="label mt-2">
            <span className="label-text-alt">
              Any file <em>should</em> work. File size limited to about 5mb
              total.
            </span>
          </p>
        </div>

        <Divider>and / or</Divider>

        <div className="space-y-4 form-control">
          <label className="label text-xl" htmlFor={ids.textarea}>
            your text
          </label>
          <textarea
            id={ids.textarea}
            name="text"
            className="form-control textarea textarea-primary w-full min-h-[16rem]"
            placeholder="your text here"
            defaultValue={
              (actionData?.status === 'success' && actionData.text) || ''
            }
            disabled={isLoading}
          />
        </div>

        <button
          type="submit"
          className={`btn btn-primary btn-block ${isLoading ? 'loading' : ''}`}
        >
          see sizes!
        </button>
      </Form>
      <Link
        to="."
        className={cx(
          'btn btn-ghost btn-block btn-outline',
          isLoading && 'btn-disabled'
        )}
      >
        Reset
      </Link>
    </main>
  )
}

export const ErrorBoundary = () => {
  return (
    <main className="space-y-8">
      <h1 className="text-5xl mt-8">something broke somewhere</h1>

      <Link to="." className="btn btn-ghost btn-block btn-outline">
        Try again ?
      </Link>
    </main>
  )
}
