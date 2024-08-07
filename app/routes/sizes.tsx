import { FormEventHandler, useRef, useState } from 'react'
import { ActionFunctionArgs, json } from '@remix-run/node'
import CompressionFormatOptions, {
  CompressionFormatToggle,
} from '~/components/CompressionFormatOptions'
import Divider from '~/components/Divider'
import FileInput, { FileSizeInfo } from '~/components/FileInput'
import SizesResultTable from '~/components/SizesResultTable'
import BaseForm from '~/components/ui/BaseForm'
import ErrorSection from '~/components/ui/sections/ErrorSection'
import ResetButton from '~/components/ui/ResetButton'
import ResultsSection from '~/components/ui/sections/ResultsSection'
import SubmitButton from '~/components/ui/SubmitButton'
import { getUtilBySlug, Util } from '~/lib/all-utils.server'
import { download } from '~/lib/download.client'
import {
  BROTLI_LEVEL_RANGE,
  DEFLATE_LEVEL_RANGE,
  GZIP_LEVEL_RANGE,
  SizesRequestErrors,
} from '~/lib/sizes'
import { sizesRequestBodySchema } from '~/lib/sizes.server'
import { getAllSizes, type Sizes } from '~/lib/sizes.server'
import { MAX_FILE_SIZE, parseMultipartFormData } from '~/lib/uploads.server'
import { commonMetaFactory } from '~/lib/all-utils'
import Link from '~/components/BaseLink'
import UtilLayout from '~/components/ui/layouts/UtilLayout'
import FormControl from '~/components/ui/forms/FormControl'
import FormLabel from '~/components/ui/forms/FormLabel'
import Textarea from '~/components/ui/forms/Textarea'
import { ApiRef } from '~/components/ApiRef'
import { ContentType, ParamSource } from '~/components/ApiRef/types'
import { highlight } from '~/lib/prism.server'
import { passthroughCachingHeaderFactory } from '~/lib/headers'
import { humanFileSize } from '~/lib/utils'
import toast from 'react-hot-toast'
import {
  useActionData,
  useLoaderData,
  useNavigation,
  useRouteError,
  useSubmit,
} from '@remix-run/react'
import { ErrorBoundaryComponent } from '@remix-run/react/dist/routeModules'

export const meta = commonMetaFactory<LoaderData>()
export const headers = passthroughCachingHeaderFactory()

type ActionData =
  | {
      status: 'success'
      text: string | null
      textSizes?: Sizes
      files: Record<string, Sizes>
      total?: Sizes
    }
  | ({ status: 'error' } & SizesRequestErrors)

export const action = async ({ request }: ActionFunctionArgs) => {
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
    const _payload: Record<string, unknown> = Object.fromEntries(formData)
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
  } as ActionData
}

type LoaderData = {
  maxSize: number
  utilData: Util
  highlighted: { apiExample: string }
}

export const loader = async () => {
  const utilData = getUtilBySlug('sizes')
  const apiExample = highlight(
    JSON.stringify(
      {
        text: {
          initial: 672,
          deflate: 308,
          gzip: 320,
          brotli: 283,
        },
        files: {
          'test-file.txt': {
            initial: 3006723,
            deflate: 1280565,
            gzip: 1280577,
            brotli: 1199472,
          },
        },
        total: {
          initial: 3007395,
          deflate: 1280873,
          gzip: 1280897,
          brotli: 1199755,
        },
      },
      null,
      2
    ),
    'json'
  )

  return json(
    {
      maxSize: MAX_FILE_SIZE,
      utilData,
      highlighted: { apiExample: apiExample },
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
  const { maxSize, utilData, highlighted } = useLoaderData<typeof loader>()
  const submit = useSubmit()
  const transition = useNavigation()
  const actionData = useActionData<typeof action>()
  const [files, setFiles] = useState<File[]>([])
  const formRef = useRef<HTMLFormElement>(null)
  const [resetFileInputKey, setResetFileInputKey] = useState(0)

  const isSuccess = !transition.formData && actionData?.status === 'success'
  const isError = !transition.formData && actionData?.status === 'error'
  const isComplete = isError || isSuccess
  const isLoading = Boolean(transition.formData)

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
              (actionData?.status === 'success' && actionData.text) || ''
            }
            disabled={isLoading}
          />
        </FormControl>

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

          <CompressionFormatToggle
            formatName="total"
            id="total-enabled"
            name="totalEnabled"
          />
        </details>

        <SubmitButton isLoading={isLoading}>see sizes!</SubmitButton>
      </BaseForm>
      <ResetButton isLoading={isLoading} onClick={resetForm} />

      {actionData?.status === 'error' ? (
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
            <SizesResultTable
              title="sizes for your text"
              sizes={actionData.textSizes}
            />
          ) : null}

          {actionData.total ? (
            <SizesResultTable title="total sizes" sizes={actionData.total} />
          ) : null}

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

      <Divider />

      <ApiRef
        schema={{
          endpoints: [
            {
              method: 'post',
              path: '/api/sizes',
              request: {
                contentType: ContentType.MULTIPART_FORMDATA,
                params: [
                  {
                    name: 'text',
                    source: ParamSource.FORMDATA,
                    description:
                      'Text for which you want to see the compressed size.',
                  },
                  {
                    name: 'files',
                    source: ParamSource.FORMDATA,
                    description:
                      'Files for which you want to see the compressed size. Files should have unique names.',
                  },
                ],
                note: {
                  body: (
                    <>
                      <code>text</code> and <code>files</code> are both optional
                      but at least one must be provided. If <code>text</code> is
                      empty, at least 1 file must be provided.
                    </>
                  ),
                },
              },
              response: {
                contentType: ContentType.APPLICATION_JSON,
                statuses: [
                  {
                    code: 200,
                    description:
                      'Successfully compressed & measured file sizes.',
                    example: (
                      <code
                        dangerouslySetInnerHTML={{
                          __html: highlighted.apiExample,
                        }}
                      />
                    ),
                  },
                  {
                    code: 400,
                    description: 'Invalid request parameters',
                  },
                ],
              },
            },
          ],
        }}
      />
    </UtilLayout>
  )
}

export const ErrorBoundary: ErrorBoundaryComponent = () => {
  const error = useRouteError()
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
