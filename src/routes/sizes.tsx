import CompressionFormatOptions from '~/components/sizes/CompressionFormatOptions'
import Divider from '~/components/ui/Divider'
import FileInput, { FileSizeInfo } from '~/components/ui/forms/FileInput'
import SizesResultTable from '~/components/sizes/SizesResultTable'
import { baseFormClass } from '~/components/ui/forms/BaseForm'
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
import { getAllSizes, SizesResult } from '~/lib/sizes.server'
import UtilLayout from '~/components/layouts/UtilLayout'
import FormControl from '~/components/ui/forms/FormControl'
import FormLabel from '~/components/ui/forms/FormLabel'
import Textarea from '~/components/ui/forms/Textarea'
import { ApiRef } from '~/components/ApiRef'
import {
  ApiRefSchema,
  ContentType,
  ParamSource,
} from '~/components/ApiRef/types'
import { highlight } from '~/lib/prism.server'
import { humanFileSize } from '~/lib/utils'
import toast from 'solid-toast'
import { Component, createMemo, createSignal, For, Show } from 'solid-js'
import { A, useRouteData } from 'solid-start'
import { createServerAction$ } from 'solid-start/server'
import CompressionFormatToggle from '~/components/sizes/CompressionFormatToggle'

type ActionData =
  | {
      status: 'success'
      text: string | null
      textSizes?: SizesResult
      files: Record<string, SizesResult>
      total?: SizesResult
    }
  | ({ status: 'error' } & SizesRequestErrors)

export const routeData = () => {
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

  return {
    maxSize: 5_000_000,
    utilData,
    highlighted: { apiExample: apiExample },
  }
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
  const { maxSize, utilData, highlighted } = useRouteData<typeof routeData>()
  const [submission, action] = createServerAction$(
    async (formData: FormData) => {
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

        return {
          status: 'error',
          ...parseErrors,
        } as ActionData
      }

      const { text = null, files = [], ...options } = parseResult.data

      const sizes = await getAllSizes(
        {
          text,
          files,
        },
        options
      )

      return {
        status: 'success' as const,
        text,
        textSizes: sizes.text,
        files: sizes.files,
        total: sizes.total,
      } as ActionData
    },
    { invalidate: r => console.log(r) }
  )

  const [files, setFiles] = createSignal<globalThis.File[]>([])
  let formRef: HTMLFormElement | undefined = undefined
  const [resetFileInputKey, setResetFileInputKey] = createSignal(0)

  const isSuccess = () =>
    !submission.pending && submission.result?.status === 'success'
  const isError = () =>
    !submission.pending && submission.result?.status === 'error'
  const isComplete = () => isError() || isSuccess()
  const isLoading = () => Boolean(submission.pending)

  // need this since we can't set the value of file inputs with js
  const handleSubmit = (event: SubmitEvent) => {
    event.preventDefault()
    const data = new FormData(event.currentTarget as HTMLFormElement)

    data.delete('files')
    files().forEach(file => {
      data.append('files', file)
    })

    action(data)
  }

  const resetForm = () => {
    setResetFileInputKey(k => k + 1)
    formRef?.reset()
    submission.clear()
  }

  const downloadResultsAsJson = () => {
    if (submission.result?.status !== 'success') return
    const json = JSON.stringify(
      {
        text: submission.result.text,
        total: submission.result.total,
        files: submission.result.files,
      },
      null,
      2
    )
    download(json, 'sizes.json')
  }

  const apiSchema = createMemo(() => {
    return {
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
                  <code>text</code> and <code>files</code> are both optional but
                  at least one must be provided. If <code>text</code> is empty,
                  at least 1 file must be provided.
                </>
              ),
            },
          },
          response: {
            contentType: ContentType.APPLICATION_JSON,
            statuses: [
              {
                code: 200,
                description: 'Successfully compressed & measured file sizes.',
                example: <code innerHTML={highlighted.apiExample} />,
              },
              {
                code: 400,
                description: 'Invalid request parameters',
              },
            ],
          },
        },
      ],
    } as ApiRefSchema
  })

  return (
    <UtilLayout util={utilData}>
      <action.Form
        method="post"
        aria-errormessage={isError() ? ids.formError : undefined}
        class={baseFormClass}
        onSubmit={handleSubmit}
        enctype="multipart/form-data"
        ref={formRef}
      >
        <FormControl>
          <FormLabel for={ids.fileInput}>Your files</FormLabel>
          <FileInput
            // TODO: reload component when key changes
            // key={resetFileInputKey}
            id={ids.fileInput}
            name="files"
            itemsName="files to measure"
            aria-describedby={ids.fileInputHelpText}
            disabled={isLoading()}
            onFiles={setFiles}
            onError={() =>
              toast.error(
                <div class="space-y-2">
                  <p class="font-bold">Invalid files ignored</p>
                  <p class="text-sm">
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
          ></FileInput>
          <FileSizeInfo id={ids.fileInputHelpText} maxSize={maxSize} />
        </FormControl>

        <Divider>and / or</Divider>

        <FormControl>
          <FormLabel for={ids.textarea}>Your text</FormLabel>
          <Textarea
            id={ids.textarea}
            name="text"
            minHeight="16rem"
            placeholder="Your text here"
            disabled={isLoading()}
          />
        </FormControl>

        <details class="space-y-8 bg-base-300 p-4 rounded-btn focus-within:outline-primary outline-offset-2">
          <summary class="cursor-pointer -m-4 p-4 focus-outline rounded-btn">
            <h2 class="inline-block ml-1">Compression options</h2>
          </summary>

          <CompressionFormatOptions
            formatName="Deflate"
            idBase="deflate-options"
            levelName="deflateLevel"
            toggleName="deflateEnabled"
            levelRange={DEFLATE_LEVEL_RANGE}
          />

          <hr class="border-base-100" />

          <CompressionFormatOptions
            formatName="Gzip"
            idBase="gzip-options"
            levelName="gzipLevel"
            toggleName="gzipEnabled"
            levelRange={GZIP_LEVEL_RANGE}
          />

          <hr class="border-base-100" />

          <CompressionFormatOptions
            formatName="Brotli"
            idBase="brotli-options"
            levelName="brotliLevel"
            toggleName="brotliEnabled"
            levelRange={BROTLI_LEVEL_RANGE}
          />

          <hr class="border-base-100" />

          <CompressionFormatToggle
            formatName="Initial size"
            id="initial-enabled"
            name="initialEnabled"
          />

          <hr class="border-base-100" />

          <CompressionFormatToggle
            formatName="Total"
            id="total-enabled"
            name="totalEnabled"
          />
        </details>

        <SubmitButton isSubmitting={isLoading()}>see sizes!</SubmitButton>
        <ResetButton
          isSubmitting={isLoading()}
          onClick={resetForm}
          resetHref="."
        />
      </action.Form>
      <Show
        when={
          submission.result?.status === 'error' && submission.result.formErrors
        }
        keyed
      >
        {errors => (
          <ErrorSection utilSlug={utilData.slug}>
            <div aria-live="assertive" class="space-y-6" id={ids.formError}>
              <ul class="list-disc pl-8 space-y-3">
                <For each={errors}>{message => <li>{message}</li>}</For>
              </ul>
            </div>
          </ErrorSection>
        )}
      </Show>
      <Show
        when={submission.result?.status === 'success' && submission.result}
        keyed
      >
        {result => (
          <ResultsSection
            scrollOnMount
            title="your results"
            utilSlug={utilData.slug}
          >
            <For each={Object.entries(result.files || {})}>
              {([name, sizes]) => (
                <SizesResultTable
                  title={
                    <>
                      sizes for your file: <code>{name}</code>
                    </>
                  }
                  sizes={sizes}
                />
              )}
            </For>

            <Show when={result.textSizes} keyed>
              {sizes => (
                <SizesResultTable title="sizes for your text" sizes={sizes} />
              )}
            </Show>

            <Show when={result.total} keyed>
              {sizes => <SizesResultTable title="total sizes" sizes={sizes} />}
            </Show>

            <div class="grid gap-6">
              <button type="button" class="btn" onClick={downloadResultsAsJson}>
                Download as JSON
              </button>
            </div>
          </ResultsSection>
        )}
      </Show>
      <Show when={isComplete()}>
        <ResetButton
          isSubmitting={isLoading()}
          onClick={resetForm}
          resetHref="."
        />
      </Show>
      <Divider />
      <ApiRef schema={apiSchema()}></ApiRef>
    </UtilLayout>
  )
}

export const ErrorBoundary: Component<{ error: Error }> = ({ error }) => {
  console.error(error)

  return (
    <main class="space-y-8">
      <h1 class="text-5xl mt-8">something broke somewhere :(</h1>
      <p>
        Maybe you uploaded files that were too big? Check the console for more
        details
      </p>

      <A href="." class="btn btn-ghost btn-block btn-outline">
        Try again ?
      </A>
    </main>
  )
}
