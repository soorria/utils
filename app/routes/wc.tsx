import { FormEventHandler, useRef, useState } from 'react'
import {
  ActionFunction,
  useActionData,
  useLoaderData,
  useTransition,
  json,
  useSubmit,
  ErrorBoundaryComponent,
} from 'remix'
import Divider from '~/components/Divider'
import FileInput, { FileSizeInfo } from '~/components/FileInput'
import BaseForm from '~/components/ui/BaseForm'
import ErrorSection from '~/components/ui/sections/ErrorSection'
import ResetButton from '~/components/ui/ResetButton'
import ResultsSection from '~/components/ui/sections/ResultsSection'
import SubmitButton from '~/components/ui/SubmitButton'
import { getUtilBySlug } from '~/lib/all-utils.server'
import { download } from '~/lib/download.client'
import { Sizes } from '~/lib/sizes.server'
import { MAX_FILE_SIZE, parseMultipartFormData } from '~/lib/uploads.server'
import { commonMetaFactory } from '~/lib/all-utils'
import Link from '~/components/BaseLink'
import UtilLayout from '~/components/ui/layouts/UtilLayout'
import FormControl from '~/components/ui/forms/FormControl'
import FormLabel from '~/components/ui/forms/FormLabel'
import Textarea from '~/components/ui/forms/Textarea'
import { passthroughCachingHeaderFactory } from '~/lib/headers'
import { humanFileSize } from '~/lib/utils'
import toast from 'react-hot-toast'
import {
  doWC,
  DoWCResult,
  wcRequestBodySchema,
  WCRequestErrors,
} from '~/lib/wc'
import WCResultTable from '~/components/WCResultTable'

export const meta = commonMetaFactory()
export const headers = passthroughCachingHeaderFactory()

type ActionData =
  | ({ status: 'success'; inputText: string } & DoWCResult)
  | ({ status: 'error' } & WCRequestErrors)

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

  const parseResult = await wcRequestBodySchema.spa(payload)

  if (!parseResult.success) {
    const parseErrors = parseResult.error.flatten()

    return json(
      {
        status: 'error',
        ...parseErrors,
      },
      400
    )
  }

  const { text, files = [], ...options } = parseResult.data

  const wcs = await doWC({
    text,
    files,
  })

  return {
    status: 'success',
    inputText: text,
    text: wcs.text,
    files: wcs.files,
    total: wcs.total,
  }
}

export const loader = async () => {
  const utilData = getUtilBySlug('wc')
  return json(
    {
      maxSize: MAX_FILE_SIZE,
      utilData,
    },
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
  const { maxSize, utilData } = useLoaderData<typeof loader>()
  const submit = useSubmit()
  const transition = useTransition()
  const actionData = useActionData<ActionData>()
  const [files, setFiles] = useState<File[]>([])
  const formRef = useRef<HTMLFormElement>(null)
  const [resetFileInputKey, setResetFileInputKey] = useState(0)

  const isSuccess = !transition.submission && actionData?.status === 'success'
  const isError = !transition.submission && actionData?.status === 'error'
  const isComplete = isError || isSuccess
  const isLoading = Boolean(transition.submission)

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
    <UtilLayout util={utilData}>
      <BaseForm
        method="post"
        aria-errormessage={isError ? ids.formError : undefined}
        onSubmit={handleSubmit}
        encType="multipart/form-data"
        ref={formRef}
      >
        <FormControl>
          <FormLabel htmlFor={ids.fileInput}>your files</FormLabel>
          <FileInput
            key={resetFileInputKey}
            id={ids.fileInput}
            name="files"
            itemsName="files to measure"
            aria-describedby={ids.fileInputHelpText}
            disabled={isLoading}
            onFiles={files => setFiles(files)}
            onError={() =>
              toast.error(
                <div className="space-y-2">
                  <p className="font-bold">Invalid files ignored</p>
                  <p className="text-sm">
                    Files must be less than {humanFileSize(maxSize)}.
                  </p>
                </div>,
                {
                  duration: 5000,
                }
              )
            }
            multiple
            maxSize={maxSize}
          />
          <FileSizeInfo id={ids.fileInputHelpText} maxSize={maxSize} />
        </FormControl>

        <Divider>and / or</Divider>

        <FormControl>
          <FormLabel htmlFor={ids.textarea}>your text</FormLabel>
          <Textarea
            id={ids.textarea}
            name="text"
            minHeight="16rem"
            placeholder="your text here"
            defaultValue={
              (actionData?.status === 'success' && actionData.inputText) || ''
            }
            disabled={isLoading}
          />
        </FormControl>

        <SubmitButton isLoading={isLoading}>use wc!</SubmitButton>
      </BaseForm>
      <ResetButton isLoading={isLoading} onClick={resetForm} />

      {isError ? (
        <ErrorSection utilSlug={utilData.slug}>
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
        <ResultsSection
          scrollOnMount
          title="your results"
          utilSlug={utilData.slug}
        >
          <WCResultTable
            files={actionData.files}
            text={actionData.text}
            total={actionData.total}
          />

          <div className="grid gap-6">
            <button
              type="button"
              className="btn"
              onClick={downloadResultsAsJson}
            >
              Download as JSON
            </button>
          </div>
        </ResultsSection>
      ) : null}

      {isComplete && <ResetButton isLoading={isLoading} onClick={resetForm} />}
    </UtilLayout>
  )
}

export const ErrorBoundary: ErrorBoundaryComponent = ({ error }) => {
  console.error(error)

  return (
    <main className="space-y-8">
      <h1 className="text-5xl mt-8">something broke somewhere :(</h1>
      <p>
        Maybe you uploaded files that were too big? Check the console for more
        details
      </p>

      <Link to="." className="btn btn-ghost btn-block btn-outline">
        Try again ?
      </Link>
    </main>
  )
}
