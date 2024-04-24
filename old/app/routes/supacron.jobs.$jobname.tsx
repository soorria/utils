import { json, LoaderFunction, ActionFunction, redirect } from '@remix-run/node'
import dedent from 'dedent'
import { highlight } from '~/lib/prism.server'
import {
  getCronJobByName,
  requireConfigFromSession,
  sbConnStringSession,
  withClient,
  CronJob,
  deleteCronJobByName,
} from '~/lib/supacron'
import { cx, getCookieHeader } from '~/lib/utils'
import { ActionMethodInput, getActionFromFormData } from '~/lib/action-utils'
import Dialog, {
  DialogActions,
  DialogBox,
  DialogCloseAction,
  DialogDescription,
  DialogHeading,
  useDialog,
} from '~/components/ui/Dialog'
import { ClientOnly } from 'remix-utils/client-only'
import SubmitButton from '~/components/ui/SubmitButton'
import BaseForm from '~/components/ui/BaseForm'
import { getUtilBySlug } from '~/lib/all-utils.server'
import BaseLink from '~/components/BaseLink'
import Divider from '~/components/Divider'
import BaseSection from '~/components/ui/sections/BaseSection'
import { Form, useLoaderData, useNavigation, useParams } from '@remix-run/react'

type LoaderData = {
  job: CronJob
  highlightedCommand: string
}

export const action: ActionFunction = async ({ request, params }) => {
  const { jobname } = params

  if (typeof jobname !== 'string') {
    throw json({ jobname }, 404)
  }

  const [formData, config] = await Promise.all([
    request.formData(),
    sbConnStringSession
      .getSession(getCookieHeader(request))
      .then(requireConfigFromSession),
  ])

  const action = getActionFromFormData(formData)

  if (action === 'delete') {
    await withClient(config, client =>
      deleteCronJobByName(client, { name: jobname })
    )
    return redirect(`${getUtilBySlug('supacron').path}/jobs`)
  }

  throw json({ jobname }, 404)
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

  const highlightedCommand = highlight(dedent(job.command), 'sql')

  return json<LoaderData>({ job, highlightedCommand })
}

const JobDetails = () => {
  const { job, highlightedCommand } = useLoaderData<LoaderData>()
  const transition = useNavigation()
  const dialog = useDialog({ id: 'job-delete' })

  const isDeleting =
    transition.formData &&
    getActionFromFormData(transition.formData) === 'delete'
  const deleteTriggerText = isDeleting ? 'Deleting' : 'Delete Job'

  return (
    <>
      <BaseLink className="link md:hidden mb-4 link-hover inline-block" to="..">
        &larr; Back to all jobs
      </BaseLink>
      <BaseSection
        className={cx(
          'sticky top-4 transition-opacity',
          isDeleting && 'opacity-80'
        )}
        variant="MINIMAL"
        title={
          <>
            <code className="break-all pr-2">{job.jobname}</code> Details
          </>
        }
      >
        <div className="flex items-center space-x-2">
          <span className="bold text-lg">Schedule </span>
          <span className="flex-1" />
          <span className="">
            <code>{job.schedule}</code>
          </span>
        </div>

        <div className="flex items-center space-x-2">
          <span className="bold text-lg">Created By</span>
          <span className="flex-1" />
          <span className="">{job.username}</span>
        </div>

        <div className="flex items-center space-x-2">
          <span className="bold text-lg">Id</span>
          <span className="flex-1" />
          <span className="">{job.jobid}</span>
        </div>

        <div className="space-y-2">
          <p className="bold text-lg">Command</p>
          <div className="overflow-hidden rounded-btn border-2 border-primary">
            <pre className="overflow-auto p-4 language-sql !m-0 !rounded-none">
              <code
                className="language-sql"
                dangerouslySetInnerHTML={{ __html: highlightedCommand }}
              />
            </pre>
          </div>
        </div>

        <div className="h-12" />

        <BaseLink to="edit" className="btn btn-secondary btn-block">
          Edit Job
        </BaseLink>

        <Divider />

        <ClientOnly
          fallback={
            <Form method="post">
              <ActionMethodInput action="delete" />
              <button
                disabled={isDeleting}
                className={cx(
                  'btn btn-error btn-sm btn-block btn-outline',
                  isDeleting && 'loading'
                )}
                type="submit"
              >
                {deleteTriggerText}
              </button>
            </Form>
          }
        >
          {() => (
            <>
              <button
                className={cx(
                  'btn btn-error btn-sm btn-block btn-outline',
                  isDeleting && 'loading'
                )}
                disabled={isDeleting}
                type="button"
                {...dialog.api.triggerProps}
              >
                {deleteTriggerText}
              </button>
              <Dialog api={dialog.api}>
                <DialogBox>
                  <DialogHeading>Delete {job.jobname}</DialogHeading>
                  <DialogDescription>
                    Are you sure you want to delete the cron job {job.jobname}?
                  </DialogDescription>
                  <DialogActions>
                    <DialogCloseAction>Cancel</DialogCloseAction>
                    <BaseForm baseStyles={false} method="post">
                      <ActionMethodInput action="delete" />
                      <input type="hidden" name="jobid" value={job.jobid} />
                      <SubmitButton isLoading={isDeleting}>Delete</SubmitButton>
                    </BaseForm>
                  </DialogActions>
                </DialogBox>
              </Dialog>
            </>
          )}
        </ClientOnly>
      </BaseSection>
    </>
  )
}

export default JobDetails

export const CatchBoundary = () => {
  const { jobname } = useParams<{ jobname: string }>()
  return <div>Job with name '{jobname}' not found</div>
}
