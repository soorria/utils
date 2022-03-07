import {
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
  ErrorBoundaryComponent,
} from 'remix'
import CompressionFormatOptions, {
  CompressionFormatToggle,
} from '~/components/CompressionFormatOptions'
import Divider from '~/components/Divider'
import FileInput from '~/components/FileInput'
import ResultSection from '~/components/ResultSection'
import {
  BROTLI_LEVEL_RANGE,
  DEFLATE_LEVEL_RANGE,
  GZIP_LEVEL_RANGE,
  SizesRequestErrors,
  sizesRequestSchema,
} from '~/lib/sizes'
import { getAllSizes, SizeFormats, Sizes } from '~/lib/sizes.server'
import { MAX_FILE_SIZE, parseMultipartFormData } from '~/lib/uploads.server'
import {
  capitalise,
  cx,
  randomItem,
  range,
  WeightedRandomArray,
  weightedRandomItem,
} from '~/lib/utils'

type ActionData =
  | {
      status: 'success'
      text: string | null
      textSizes?: Sizes
      files: Record<string, Sizes>
    }
  | ({ status: 'error' } & SizesRequestErrors)

export const action: ActionFunction = async ({ request }) => {
  const formData = await parseMultipartFormData(request)

  if (!formData) {
    return json<ActionData>(
      {
        status: 'error',
        formErrors: [
          "I couldn't read your submission. Maybe the files your uploaded are too large?",
        ],
        fieldErrors: {},
      },
      413
    )
  }

  const payload: unknown = (() => {
    const inputFiles = formData.getAll('files')
    formData.delete('files')
    const _payload: any = Object.fromEntries(formData)
    _payload.files = inputFiles
    return _payload
  })()
  const parseResult = await sizesRequestSchema.spa(payload)

  if (!parseResult.success) {
    const parseErrors = parseResult.error.flatten()

    return json<ActionData>(
      {
        status: 'error',
        ...parseErrors,
      },
      400
    )
  }

  const { text, files = [], ...options } = parseResult.data

  const sizes = await getAllSizes(
    {
      text,
      files,
    },
    options
  )

  return {
    status: 'success',
    text,
    textSizes: sizes.text,
    files: sizes.files,
  }
}

type LoaderData = { title: string; maxSize: string }

export const loader: LoaderFunction = () => {
  const titles: WeightedRandomArray<string> = [
    ['character counter', 1],
    ['measuring machine', 1],
    ['byte counter', 1],
    ['measuring tape', 1],
    ['measurement measurer', 0.01],
    ['crappy counter', 1],
  ]

  const maxSize = `~${(MAX_FILE_SIZE / 1e6).toFixed(1)}MB`

  return json(
    { title: weightedRandomItem(titles), maxSize },
    { headers: { 'Cache-Control': 's-max-age=10, public' } }
  )
}

const ids = {
  formError: 'form-error',
  textarea: 'text',
  fileInput: 'file',
  fileInputHelpText: 'file-help-text',
  brotliLevel: 'brotli-level',
  gzipLevel: 'gzip-level',
  deflateLevel: 'deflate-level',
}

export default function Index() {
  const { title, maxSize } = useLoaderData<LoaderData>()
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
      replace: true,
    })
  }

  return (
    <main className="space-y-8">
      <h1 ref={titleRef} className="text-5xl mt-8 scroll-mt-8">
        {title}
      </h1>

      {isError ? (
        <div className="space-y-6 p-4 md:p-8 border-error border-2 rounded-btn">
          <h2 className="text-3xl text-error">something went wrong :(</h2>
          <div aria-live="assertive" className="space-y-6" id={ids.formError}>
            <ul className="list-disc pl-8 space-y-3">
              {actionData.formErrors?.map((message, i) => (
                <li key={i}>{message}</li>
              ))}
            </ul>

            <p className="text-center text-sm">
              <a
                href="https://mooth.tech/?ref=Sizes&utm_content=ErrorLink#contact"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline group focus-outline px-2"
              >
                If this is unexpected,{' '}
                <span className="underline group-hover:no-underline">
                  let me know
                </span>{' '}
                what happened.
              </a>
            </p>
          </div>
        </div>
      ) : null}

      {isSuccess ? (
        <div className="space-y-6 p-4 md:p-4 border-success border-2 rounded-btn">
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

          <p className="text-center text-sm">
            <a
              href="https://mooth.tech/?ref=Sizes&utm_content=ErrorLink#contact"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline group focus-outline px-2"
            >
              <span className="underline group-hover:no-underline">
                Let me know
              </span>{' '}
              if something looks off
            </a>
          </p>
        </div>
      ) : null}

      <Form
        replace
        method="post"
        className="space-y-8"
        aria-errormessage={isError ? ids.formError : undefined}
        onSubmit={handleSubmit}
        encType="multipart/form-data"
      >
        <div className="form-control">
          <label className="label text-xl mb-4" htmlFor={ids.fileInput}>
            your files
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
              Any file <em>should</em> work. File size limited to about{' '}
              {maxSize}. App may explode (idk why) or not work as expected
              (vercel payload limits) if the payload is too large.
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
            className="form-control textarea textarea-primary rounded-btn w-full min-h-[16rem]"
            placeholder="your text here"
            defaultValue={
              (actionData?.status === 'success' && actionData.text) || ''
            }
            disabled={isLoading}
          />
        </div>

        <details className="space-y-8 bg-base-200 p-4 rounded-btn focus-within:outline-primary outline-offset-2">
          <summary className="cursor-pointer -m-4 p-4 focus-outline rounded-btn">
            <h2 className="inline-block ml-1">compression options</h2>
          </summary>

          <CompressionFormatOptions
            formatName="deflate"
            idBase="deflate-options"
            levelName="deflateLevel"
            toggleName="deflateEnabled"
            levelRange={DEFLATE_LEVEL_RANGE}
          />

          <hr className="border-base-100" />

          <CompressionFormatOptions
            formatName="gzip"
            idBase="gzip-options"
            levelName="gzipLevel"
            toggleName="gzipEnabled"
            levelRange={GZIP_LEVEL_RANGE}
          />

          <hr className="border-base-100" />

          <CompressionFormatOptions
            formatName="brotli"
            idBase="brotli-options"
            levelName="brotliLevel"
            toggleName="brotliEnabled"
            levelRange={BROTLI_LEVEL_RANGE}
          />

          <hr className="border-base-100" />

          <CompressionFormatToggle
            formatName="initial size"
            id="initial-enabled"
            name="initialEnabled"
          />
        </details>

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
        start over
      </Link>
    </main>
  )
}

export const ErrorBoundary: ErrorBoundaryComponent = ({ error }) => {
  console.error(error)

  return (
    <main className="space-y-8">
      <h1 className="text-5xl mt-8">something broke somewhere :(</h1>
      <p>Maybe you uploaded files that were too big?</p>

      <Link to="." className="btn btn-ghost btn-block btn-outline">
        Try again ?
      </Link>
    </main>
  )
}
