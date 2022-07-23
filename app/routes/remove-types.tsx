import {
  json,
  LinksFunction,
  LoaderFunction,
  useLoaderData,
  useSearchParams,
  useTransition,
} from 'remix'
import BaseForm from '~/components/ui/BaseForm'
import ResetButton from '~/components/ui/ResetButton'
import SubmitButton from '~/components/ui/SubmitButton'
import { getUtilBySlug, Util } from '~/lib/all-utils.server'
import { useCallback, useEffect, useRef, useState } from 'react'
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
import BaseSection from '~/components/ui/sections/BaseSection'
import ErrorSection from '~/components/ui/sections/ErrorSection'
import { commonMetaFactory } from '~/lib/all-utils'
import UtilLayout from '~/components/ui/layouts/UtilLayout'
import FormControl from '~/components/ui/forms/FormControl'
import FormLabel from '~/components/ui/forms/FormLabel'
import { passthroughCachingHeaderFactory } from '~/lib/headers'
import CodeMirrorTextarea, { codeMirrorLinks } from '~/components/ui/forms/CodeMirrorTextarea'
import { highlight } from '~/lib/prism.server'

if (typeof window !== 'undefined') {
  require('codemirror/mode/javascript/javascript')
  require('codemirror/mode/jsx/jsx')
}

export const links: LinksFunction = () => {
  return [...codeMirrorLinks]
}

export const meta = commonMetaFactory<LoaderData>()

type LoaderData = {
  utilData: Util
  result: RemoveTypesResult
  options?: RemoveTypesOptions
  highlightedJs?: string | null
}

export const headers = passthroughCachingHeaderFactory()

export const loader: LoaderFunction = async ({ request }) => {
  const successHeaders: HeadersInit = {
    'Cache-Control': 'public, s-maxage=31536000',
  }
  const url = new URL(request.url)
  const params = Object.fromEntries(url.searchParams)
  const utilData = getUtilBySlug('remove-types')

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

  const highlightedJs =
    result.status === 'success' ? highlight(result.js, options.isTsx ? 'jsx' : 'js') : null

  return json<LoaderData>(
    { utilData, result, options, highlightedJs },
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
  const { utilData, result, options, highlightedJs } = useLoaderData<LoaderData>()
  const transition = useTransition()
  const [params] = useSearchParams()
  const [isTsx, setIsTsx] = useState(options?.isTsx)

  const formRef = useRef<HTMLFormElement>(null)

  const [copy, copied] = useCopy()

  const didSubmit = Boolean(params.get('ts'))
  const isIdle =
    !didSubmit &&
    (transition.state === 'idle' ||
      (transition.state === 'loading' && transition.location.pathname !== utilData.path))
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

  return (
    <UtilLayout util={utilData}>
      <BaseForm method="get" ref={formRef}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <BaseSection title="TypeScript" variant="MINIMAL">
            <FormControl>
              <FormLabel htmlFor={IDS.ts}>your typescript code</FormLabel>
              <CodeMirrorTextarea
                spellCheck="false"
                disabled={isSubmitting}
                options={{
                  mode: isTsx ? 'text/typescript-jsx' : 'application/typescript',
                }}
                id={IDS.ts}
                name="ts"
                className="font-mono leading-tight"
                placeholder="your text here"
                defaultValue={result.ts}
              />
            </FormControl>

            <FormControl variant="INLINE">
              <FormLabel className="flex-1" htmlFor={IDS.isTsx}>
                does this code have tsx?
              </FormLabel>
              <input
                type="checkbox"
                className="toggle toggle-primary"
                id={IDS.isTsx}
                defaultChecked={options?.isTsx}
                onChange={e => setIsTsx(e.currentTarget.checked)}
                name="isTsx"
              />
            </FormControl>

            <FormControl variant="INLINE">
              <FormLabel className="cursor-pointer flex-1" htmlFor={IDS.copyWhenDone}>
                copy to clipboard when done
              </FormLabel>
              <input
                type="checkbox"
                className="toggle toggle-primary"
                id={IDS.copyWhenDone}
                defaultChecked={options?.copyWhenDone}
                name="copyWhenDone"
              />
            </FormControl>
          </BaseSection>

          {isIdle && (
            <BaseSection title="JavaScript" variant="MINIMAL">
              <p className="text-xl py-2">
                You'll see your TypeScript code without its types here!
              </p>
            </BaseSection>
          )}
          {isSubmitting && (
            <SectionLoader variant="MINIMAL">
              <FormControl>
                <div className="skeleton h-11 w-36" />
                <div className="skeleton min-h-[16rem]" />
              </FormControl>
            </SectionLoader>
          )}
          {isSuccess && (
            <ResultsSection utilSlug={utilData.slug} title="JavaScript" variant="MINIMAL">
              <FormControl>
                <p className="label">
                  <span className="label-text">de-typed code</span>
                </p>
                <pre className="font-mono leading-tight textarea textarea-primary rounded-btn w-full min-h-[16rem] overflow-x-auto">
                  <code dangerouslySetInnerHTML={{ __html: highlightedJs || '' }} />
                </pre>
              </FormControl>

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
            <ErrorSection utilSlug={utilData.slug} variant="MINIMAL">
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

        <SubmitButton isLoading={isSubmitting}>Remove Types</SubmitButton>
      </BaseForm>
      <ResetButton onClick={() => formRef.current?.reset()} />
    </UtilLayout>
  )
}

export default RemoveTypes
