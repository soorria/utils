import { ExclamationCircleIcon as ExclamationIcon } from '@heroicons/react/24/solid'
import {
  ActionFunction,
  json,
  LoaderFunction,
  redirect,
} from '@remix-run/node'
import { useActionData, useLoaderData, useNavigation } from '@remix-run/react'
import invariant from 'tiny-invariant'

import BaseLink from '~/components/BaseLink'
import BaseSection from '~/components/ui/sections/BaseSection'
import { getUtilBySlug } from '~/lib/all-utils.server'
import { CronJobForm } from '~/lib/supacron/forms'
import { requireConfigFromSession, withClient } from '~/lib/supacron/pg.server'
import { updateCronJob, getCronJobByName } from '~/lib/supacron/queries.server'
import { sbConnStringSession } from '~/lib/supacron/session.server'
import { CronJob } from '~/lib/supacron/types'
import { UpdateCronJobSchemaErrors, UpdateCronJobSchema, updateCronJobSchema } from '~/lib/supacron/validation.server'
import { cx, getCookieHeader, getErrorMap } from '~/lib/utils'

type LoaderData = {
  job: CronJob
  user: string
}

type ActionData = Partial<UpdateCronJobSchemaErrors> & {
  data: Record<keyof UpdateCronJobSchema, unknown>
}

export const action: ActionFunction = async ({ request, params }) => {
  const { jobname } = params
  invariant(jobname)

  const formdata = await request.formData()

  const data = Object.fromEntries(formdata)

  const parseResult = await updateCronJobSchema.spa(data)

  if (!parseResult.success) {
    return json<ActionData>({
      ...parseResult.error.flatten(),
      data: data as any,
    })
  }

  const config = await sbConnStringSession
    .getSession(getCookieHeader(request))
    .then(requireConfigFromSession)

  await withClient(config, client =>
    updateCronJob(client, {
      ...parseResult.data,
      name: jobname,
      username: config.user,
    })
  )

  return redirect(`${getUtilBySlug('supacron').path}/jobs/${jobname}`)
}

export const loader: LoaderFunction = async ({ params, request }) => {
  const { jobname } = params

  if (typeof jobname !== 'string') {
    throw json({ jobname }, 404)
  }

  const session = await sbConnStringSession.getSession(getCookieHeader(request))
  const config = await requireConfigFromSession(session)

  const job = await withClient(config, client =>
    getCronJobByName(client, { name: jobname })
  )

  if (!job) {
    throw json({ jobname }, 404)
  }

  job.command = job.command

  return json<LoaderData>({ job, user: config.user })
}

const JobDetails = () => {
  const { job, user } = useLoaderData<LoaderData>()
  const transition = useNavigation()
  const actionData = useActionData<ActionData>()

  const isSubmitting = Boolean(transition.formData)

  const { data: submittedData, fieldErrors } = actionData || {}
  const data = { ...job, submittedData }

  const errorMap = getErrorMap(fieldErrors || {})

  return (
    <>
      <BaseLink className="link md:hidden mb-4 link-hover inline-block" to="..">
        &larr; Back to job details
      </BaseLink>
      <BaseSection
        className={cx('sticky top-4 transition-opacity')}
        variant="MINIMAL"
        title={<>Edit {job.jobname}</>}
      >
        {job.username !== user && (
          <div
            aria-live="polite"
            className="p-4 bg-warning text-warning-content rounded-box flex space-x-2"
          >
            <div>
              <ExclamationIcon className="w-6 h-6 flex-grow-1 block" />
            </div>
            <p className="flex-shrink">
              This cron job was created by the <code>{job.username}</code> user,
              but you&apos;re connected as the <code>{user}</code> user.
              Updating this cron job will delete the existing job and create a
              new one to replace it.
            </p>
          </div>
        )}
        <CronJobForm
          fields={{
            name: false,
            schedule: true,
            command: true,
          }}
          errors={errorMap}
          submitText="Save Changes"
          cancelText="Cancel Edit"
          cancelHref={`../${data.jobname}`}
          defaultValues={data}
          isSubmitting={isSubmitting}
        />
      </BaseSection>
    </>
  )
}

export default JobDetails
