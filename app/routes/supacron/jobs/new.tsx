import { ActionFunction, json, LinksFunction, redirect, useActionData, useTransition } from 'remix'
import BaseLink from '~/components/BaseLink'
import { codeMirrorLinks } from '~/components/ui/forms/CodeMirrorTextarea'
import BaseSection from '~/components/ui/sections/BaseSection'
import { getUtilBySlug } from '~/lib/all-utils.server'
import {
  createCronJob,
  CreateCronJobSchema,
  createCronJobSchema,
  CreateCronJobSchemaErrors,
  requireConfigFromSession,
  sbConnStringSession,
  withClient,
} from '~/lib/supacron'
import { CronJobForm } from '~/lib/supacron'
import { getCookieHeader } from '~/lib/utils'

export const links: LinksFunction = () => {
  return [...codeMirrorLinks]
}

type ActionData = Partial<CreateCronJobSchemaErrors> & {
  data: Record<keyof CreateCronJobSchema, any>
}

export const action: ActionFunction = async ({ request }) => {
  const formdata = await request.formData()

  const data = Object.fromEntries(formdata)

  const parseResult = await createCronJobSchema.spa(data)

  if (!parseResult.success) {
    return json<ActionData>({
      ...parseResult.error.flatten(),
      data: data as any,
    })
  }

  const config = await sbConnStringSession
    .getSession(getCookieHeader(request))
    .then(requireConfigFromSession)

  await withClient(config, client => createCronJob(client, parseResult.data))

  const jobname = parseResult.data.name

  return redirect(`${getUtilBySlug('supacron').path}/jobs/${jobname}`)
}

const CreateNewCronJob: React.FC = () => {
  const actionData = useActionData<ActionData>()
  const transition = useTransition()
  const { data, fieldErrors } = actionData || {}

  const errorMap = Object.fromEntries(
    Object.entries(fieldErrors || ({} as Exclude<typeof fieldErrors, undefined>)).map(
      ([field, errors]) => [field, errors?.[0] || null]
    )
  ) as Partial<Record<keyof Exclude<typeof fieldErrors, undefined>, string | null>>

  const isSubmitting = Boolean(transition.submission)

  return (
    <>
      <BaseLink className="link md:hidden mb-4 link-hover inline-block" to="..">
        &larr; Back to all jobs
      </BaseLink>
      <BaseSection variant="MINIMAL" title="Create Job">
        <CronJobForm
          fields={{ name: true, schedule: true, command: true }}
          defaultValues={data}
          submitText="Create Job"
          cancelText="Cancel Create Job"
          cancelHref=".."
          isSubmitting={isSubmitting}
          errors={errorMap}
        />
      </BaseSection>
    </>
  )
}

export default CreateNewCronJob
