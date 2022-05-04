import { FormEventHandler, useEffect, useRef, useState } from 'react'
import {
  ActionFunction,
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
import SizesResultTable from '~/components/SizesResultTable'
import BaseForm from '~/components/ui/BaseForm'
import ErrorSection from '~/components/ui/sections/ErrorSection'
import MainHeading from '~/components/ui/MainHeading'
import MainLayout from '~/components/ui/MainLayout'
import ResetButton from '~/components/ui/ResetButton'
import ResultsSection from '~/components/ui/sections/ResultsSection'
import SubmitButton from '~/components/ui/SubmitButton'
import UtilDescription from '~/components/ui/UtilDescription'
import { Util, utilByPath } from '~/lib/all-utils.server'
import { download } from '~/lib/download.client'
import {
  BROTLI_LEVEL_RANGE,
  DEFLATE_LEVEL_RANGE,
  GZIP_LEVEL_RANGE,
  SizesRequestErrors,
} from '~/lib/sizes'
import { sizesRequestBodySchema } from '~/lib/sizes.server'
import { getAllSizes, Sizes } from '~/lib/sizes.server'
import { MAX_FILE_SIZE, parseMultipartFormData } from '~/lib/uploads.server'
import { commonMetaFactory } from '~/lib/all-utils'
import { sleep } from '~/lib/utils'

export const meta = commonMetaFactory<LoaderData>()

type ActionData =
  | {
      status: 'success'
      text: string | null
      textSizes?: Sizes
      files: Record<string, Sizes>
      total?: Sizes
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
  const parseResult = await sizesRequestBodySchema.spa(payload)

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
    total: sizes.total,
  }
}

type LoaderData = { maxSize: string; utilData: Util }

export const loader: LoaderFunction = async () => {
  const maxSize = `~${(MAX_FILE_SIZE / 1e6).toFixed(1)}MB`
  const utilData = utilByPath.sizes

  return json<LoaderData>(
    { maxSize, utilData },
    { headers: { 'Cache-Control': 'public, s-maxage=31536000' } }
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

export default function Sizes() {
  const {
    maxSize,
    utilData: { title, description, slug },
  } = useLoaderData<LoaderData>()
  const submit = useSubmit()
  const transition = useTransition()
  const actionData = useActionData<ActionData>()
  const [files, setFiles] = useState<File[]>([])
  const formRef = useRef<HTMLFormElement>(null)
  const [resetFileInputKey, setResetFileInputKey] = useState(0)

  const titleRef = useRef<HTMLHeadingElement>(null)

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
      replace: true,
    })
  }

  const resetForm = () => {
    setResetFileInputKey(k => k + 1)
    formRef.current?.reset()
  }

  const downloadResultsAsJson = () => {
    if (actionData?.status !== 'success') return
    const json = JSON.stringify(
      {
        text: actionData.text,
        total: actionData.total,
        files: actionData.files,
      },
      null,
      2
    )
    download(json, 'sizes.json')
  }

  return (
    <MainLayout>
      <MainHeading ref={titleRef}>{title}</MainHeading>
      <UtilDescription>{description}</UtilDescription>

      {isError ? (
        <ErrorSection utilSlug={slug}>
          <div aria-live="assertive" className="space-y-6" id={ids.formError}>
            <ul className="list-disc pl-8 space-y-3">
              {actionData.formErrors?.map((message, i) => (
                <li key={i}>{message}</li>
              ))}
            </ul>
          </div>
        </ErrorSection>
      ) : null}

      {isSuccess ? (
        <ResultsSection title="your results" utilSlug="sizes">
          {Object.entries(actionData.files).map(([name, sizes]) => (
            <SizesResultTable
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
            <SizesResultTable title="sizes for your text" sizes={actionData.textSizes} />
          ) : null}

          {actionData.total ? (
            <SizesResultTable title="total sizes" sizes={actionData.total} />
          ) : null}

          <div className="grid gap-6">
            <button className="btn" onClick={downloadResultsAsJson}>
              Download as JSON
            </button>
          </div>
        </ResultsSection>
      ) : null}

      <BaseForm
        method="post"
        aria-errormessage={isError ? ids.formError : undefined}
        onSubmit={handleSubmit}
        encType="multipart/form-data"
        ref={formRef}
      >
        <div className="form-control">
          <label className="label text-xl mb-4" htmlFor={ids.fileInput}>
            your files
          </label>
          <FileInput
            key={resetFileInputKey}
            id={ids.fileInput}
            name="files"
            aria-describedby={ids.fileInputHelpText}
            disabled={isLoading}
            onFiles={files => setFiles(files)}
          />
          <p id={ids.fileInputHelpText} className="label mt-2">
            <span className="label-text-alt">
              Any file <em>should</em> work. File size limited to about {maxSize}. App may explode
              (idk why) or not work as expected (vercel payload limits) if the payload is too large.
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
            defaultValue={(actionData?.status === 'success' && actionData.text) || ''}
            disabled={isLoading}
          />
        </div>

        <details className="space-y-8 bg-base-300 p-4 rounded-btn focus-within:outline-primary outline-offset-2">
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

          <hr className="border-base-100" />

          <CompressionFormatToggle formatName="total" id="total-enabled" name="totalEnabled" />
        </details>

        <SubmitButton>see sizes!</SubmitButton>
      </BaseForm>
      <ResetButton isLoading={isLoading} onClick={resetForm} />
    </MainLayout>
  )
}

export const ErrorBoundary: ErrorBoundaryComponent = ({ error }) => {
  console.error(error)

  return (
    <main className="space-y-8">
      <h1 className="text-5xl mt-8">something broke somewhere :(</h1>
      <p>Maybe you uploaded files that were too big? Check the console for more details</p>

      <Link to="." className="btn btn-ghost btn-block btn-outline">
        Try again ?
      </Link>
    </main>
  )
}
