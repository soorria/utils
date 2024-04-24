import BaseForm from '~/components/ui/BaseForm'
import FormControl from '~/components/ui/forms/FormControl'
import FormLabel from '~/components/ui/forms/FormLabel'
import ErrorSection from '~/components/ui/sections/ErrorSection'
import SubmitButton from '~/components/ui/SubmitButton'
import { passthroughCachingHeaderFactory } from '~/lib/headers'
import type { SupacronOutletData, ActionData } from './supacron'
import { action } from './supacron'
import {
  useActionData,
  useNavigation,
  useOutletContext,
} from '@remix-run/react'

export const headers = passthroughCachingHeaderFactory()

const IDS = {
  connectionString: 'connection-string',
  formError: 'supacron-auth-error',
}

export { action }

const SupaCronAuth = () => {
  const transition = useNavigation()
  const { utilData } = useOutletContext<SupacronOutletData>()
  const actionData = useActionData<ActionData>()

  const submitting = transition.state === 'submitting'

  const errors = [
    actionData?.connectionErrors || [],
    actionData?.formErrors || [],
  ].flat()
  const isError = !submitting && errors.length > 0
  const isConnectionError = Boolean(actionData?.connectionErrors?.length)

  return (
    <>
      {isError ? (
        <ErrorSection
          title={
            isConnectionError ? 'Failed to connect to database' : undefined
          }
          utilSlug={utilData.slug}
        >
          <div aria-live="assertive" className="space-y-6" id={IDS.formError}>
            <ul className="list-disc pl-8 space-y-3">
              {errors.map((message, i) => (
                <li key={i}>{message}</li>
              ))}
            </ul>
          </div>
        </ErrorSection>
      ) : null}
      <BaseForm replace={false} method="post">
        <FormControl>
          <FormLabel htmlFor={IDS.connectionString}>
            Database Connection String
          </FormLabel>
          <input
            id={IDS.connectionString}
            name="connectionString"
            type="text"
            defaultValue={actionData?.connectionString}
            className="input input-primary"
            placeholder="postgres://user:password@db.real.url.com:5432/database"
            disabled={submitting}
          />
          {/* <FormLabel variant="ALT" htmlFor={IDS.connectionString}>
            I you're using Supabase (or just have connection pooling enabled), I recommend using the
            connection string for the connection pool. Utils deploys to Vercel which uses serverless
            functions under the hood so if you don't use pooling you may have issues with hitting
            connection limits.
          </FormLabel> */}
        </FormControl>

        <SubmitButton isLoading={submitting}>Connect to Database</SubmitButton>
      </BaseForm>
    </>
  )
}

export default SupaCronAuth
