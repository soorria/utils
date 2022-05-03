import { json, LoaderFunction, useLoaderData, useSearchParams, useTransition } from 'remix'
import BaseForm from '~/components/ui/BaseForm'
import MainHeading from '~/components/ui/MainHeading'
import MainLayout from '~/components/ui/MainLayout'
import ResetButton from '~/components/ui/ResetButton'
import SubmitButton from '~/components/ui/SubmitButton'
import UtilDescription from '~/components/ui/UtilDescription'
import { Util, utilByPath } from '~/lib/all-utils.server'
import autosize from 'autosize'
import { useCallback, useEffect, useRef } from 'react'
import {
  removeTypes,
  RemoveTypesOptions,
  removeTypesRequestParamsSchema,
  RemoveTypesResult,
} from '~/lib/remove-types.server'
import toast from 'react-hot-toast'
import { useCopy } from '~/lib/use-copy'
import SectionLoader from '~/components/ui/sections/SectionLoader'
import ResultsSection from '~/components/ui/sections/ResultsSection'
import FormSection from '~/components/ui/sections/FormSection'
import ErrorSection from '~/components/ui/sections/ErrorSection'
import { commonMetaFactory } from '~/lib/all-utils'

export const meta = commonMetaFactory<LoaderData>()

type LoaderData = { utilData: Util; result: RemoveTypesResult; options?: RemoveTypesOptions }

export const loader: LoaderFunction = async ({ request }) => {
  const successHeaders: HeadersInit = {
    'Cache-Control': 'public, s-maxage=31536000, max-age: 86400',
  }
  const url = new URL(request.url)
  const params = Object.fromEntries(url.searchParams)
  const utilData = utilByPath['remove-types']

  const parseResult = await removeTypesRequestParamsSchema.spa(params)

  if (!parseResult.success) {
    const schemaErrors = parseResult.error.flatten()
    return json<LoaderData>({
      utilData,
      result: { status: 'error', errors: schemaErrors, ts: params.ts || '' },
    })
  }

  const { ts, ...options } = parseResult.data

  const result = await removeTypes(ts, options)

  return json<LoaderData>(
    { utilData, result, options },
    result.status === 'success'
      ? {
          headers: successHeaders,
        }
      : {}
  )
}

const IDS = {
  ts: 'ts',
  isTsx: 'isTsx',
  copyWhenDone: 'copyWhenDone',
}

const copiedToast = () => {
  toast.success('Copied JS to clipboard', { id: 'js-copied' })
}

const RemoveTypes: React.FC = () => {
  const { utilData, result, options } = useLoaderData<LoaderData>()
  const transition = useTransition()
  const [params] = useSearchParams()

  const tsInputRef = useRef<HTMLTextAreaElement>(null)
  const formRef = useRef<HTMLFormElement>(null)

  const [copy, copied] = useCopy()

  useEffect(() => {
    const textarea = tsInputRef.current
    if (textarea) {
      autosize(textarea)
      return () => {
        autosize.destroy(textarea)
      }
    }
  }, [])

  const didSubmit = Boolean(params.get('ts'))
  const isIdle =
    transition.state === 'idle' ||
    (transition.state === 'loading' && transition.location.pathname !== utilData.path)
  const isSubmitting = transition.state === 'submitting'
  const isSuccess = !isSubmitting && didSubmit && result.status === 'success'
  const isError = !isSubmitting && didSubmit && result.status === 'error'

  const shouldCopy = ['true', 'on'].includes(params.get('copyWhenDone') as any)

  const copyResult = useCallback(() => {
    if (result.status === 'success' && didSubmit && shouldCopy) {
      copy(result.js).then(() => copiedToast())
    }
  }, [result, didSubmit, shouldCopy])

  useEffect(() => {
    copyResult()
  }, [copyResult])

  if (process.env.NODE_ENV !== 'production') console.log(result)

  return (
    <MainLayout>
      <MainHeading>{utilData.title}</MainHeading>
      <UtilDescription>{utilData.description}</UtilDescription>

      <BaseForm method="get" ref={formRef}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <FormSection title="TypeScript">
            <div className="space-y-4 form-control">
              <label className="label text-xl" htmlFor={IDS.ts}>
                your typescript code
              </label>
              <textarea
                spellCheck="false"
                disabled={isSubmitting}
                ref={tsInputRef}
                id={IDS.ts}
                name="ts"
                className="form-control font-mono leading-tight textarea textarea-primary rounded-btn w-full min-h-[16rem]"
                placeholder="your text here"
                defaultValue={result.ts}
              />
            </div>

            <div className="form-control flex-row items-center">
              <label className="label cursor-pointer text-xl flex-1" htmlFor={IDS.isTsx}>
                does this code have tsx?
              </label>
              <input
                type="checkbox"
                className="toggle toggle-primary"
                id={IDS.isTsx}
                defaultChecked={options?.isTsx}
                name="isTsx"
              />
            </div>

            <div className="form-control flex-row items-center">
              <label className="label cursor-pointer text-xl flex-1" htmlFor={IDS.copyWhenDone}>
                copy to clipboard when done
              </label>
              <input
                type="checkbox"
                className="toggle toggle-primary"
                id={IDS.copyWhenDone}
                defaultChecked={options?.copyWhenDone}
                name="copyWhenDone"
              />
            </div>
          </FormSection>

          {isIdle && (
            <FormSection title="JavaScript">
              <p className="text-xl py-2">
                You'll see your TypeScript code without its types here!
              </p>
            </FormSection>
          )}
          {isSubmitting && <SectionLoader />}
          {isSuccess && (
            <ResultsSection utilSlug={utilData.slug} title="JavaScript">
              <div className="space-y-4 form-control">
                <label className="label text-xl" htmlFor={IDS.ts}>
                  your de-typed code
                </label>
                <pre className="form-control font-mono leading-tight textarea textarea-primary rounded-btn w-full min-h-[16rem] whitespace-pre-wrap">
                  {result.js}
                </pre>
              </div>

              <button
                type="button"
                className="btn btn-primary btn-sm btn-block"
                onClick={copyResult}
              >
                {copied ? 'copied!' : 'copy your de-typed code'}
              </button>
            </ResultsSection>
          )}
          {isError && (
            <ErrorSection utilSlug={utilData.slug}>
              {result.errors.esbuild?.errors ? (
                <div className="space-y-4">
                  <p className="text-xl">De-Typing Errors (esbuild)</p>
                  <ul className="list-disc pl-8 space-y-3">
                    {result.errors.esbuild.errors.map((message, i) => (
                      <li key={i}>
                        {message.text} - {message.detail}
                      </li>
                    ))}
                  </ul>
                  <p className="text-sm">
                    Try re-submitting after toggling <code>'does this code have tsx?'</code>
                  </p>
                </div>
              ) : null}
              {result.errors.babel ? (
                <div className="space-y-4">
                  <p className="text-xl">De-Typing Errors (babel)</p>
                  <p className="whitespace-pre-wrap">
                    {result.errors.babel.stack || result.errors.babel.message}
                  </p>
                  <p className="text-sm">
                    Try re-submitting after toggling <code>'does this code have tsx?'</code>
                  </p>
                </div>
              ) : null}
              {result.errors.formErrors?.length ? (
                <div className="space-y-4">
                  <p className="text-xl">Form Errors</p>
                  <ul className="list-disc pl-8 space-y-3">
                    {result.errors.formErrors.map((message, i) => (
                      <li key={i}>{message}</li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </ErrorSection>
          )}
        </div>

        <SubmitButton>Remove Types</SubmitButton>
      </BaseForm>
      <ResetButton onClick={() => formRef.current?.reset()} />
    </MainLayout>
  )
}

export default RemoveTypes
