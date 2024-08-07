import { useMemo } from 'react'
import { LoaderFunctionArgs, json } from '@remix-run/node'
import {
  XCircleIcon,
  CheckCircleIcon,
  PlusIcon,
} from '@heroicons/react/24/solid'
import { cx, getCookieHeader } from '~/lib/utils'
import type { SupacronOutletData } from './supacron'
import Bleed from '~/components/ui/Bleed'
import {
  useLocation,
  useParams,
  useOutletContext,
  Link,
  Outlet,
  useLoaderData,
} from '@remix-run/react'
import { requireConfigFromSession, withClient } from '~/lib/supacron/pg.server'
import {
  AllCronJobsResult,
  getAllCronJobs,
} from '~/lib/supacron/queries.server'
import { sbConnStringSession } from '~/lib/supacron/session.server'

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const session = await sbConnStringSession.getSession(getCookieHeader(request))
  const config = await requireConfigFromSession(session)

  const jobs = await withClient(config, getAllCronJobs)
  return json({ jobs })
}

export type SupacronJobsOutletData = {
  jobsByName: Record<string, AllCronJobsResult[number]>
}

const SupacronJobs = () => {
  const { jobs } = useLoaderData<typeof loader>()
  const location = useLocation()
  const params = useParams<{ jobname: string }>()
  const { utilData } = useOutletContext<SupacronOutletData>()

  const hideLeftSidebarOnSmallScreens = Boolean(
    location.pathname.replace(`${utilData.path}/jobs`, '').replace(/^\//, '')
  )

  const jobsByName = useMemo(() => {
    const result: SupacronJobsOutletData['jobsByName'] = {}
    jobs.forEach(job => {
      result[job.jobname] = job
    })
    return result
  }, [jobs])

  return (
    <Bleed className="grid gap-8 grid-cols-1 md:grid-cols-2/3 lg:grid-cols-3 mb-24 xl:pb-0">
      <div
        className={cx(
          hideLeftSidebarOnSmallScreens && 'hidden',
          'md:block',
          'space-y-6'
        )}
      >
        <div className="bg-base-100 flex justify-between items-end">
          <h2 className="text-3xl text-primary">Cron Jobs</h2>
        </div>
        <div className="space-y-4">
          <Link
            to="new"
            className="h-[6.5rem] p-4 flex space-x-2 justify-center items-center focus-outline border-2 border-dashed rounded-btn !transition hover:bg-base-200 border-base-content/25"
          >
            <PlusIcon className="w-6 h-6" />
            <span className="font-bold text-xl font-display">Create a Job</span>
          </Link>
          {jobs.map(job => {
            const Icon = job.active ? CheckCircleIcon : XCircleIcon

            return (
              <Link
                key={job.jobid}
                to={job.jobname}
                className={cx(
                  'p-4  flex flex-col space-y-4 group focus-outline border-2 rounded-btn !transition-all',
                  job.jobname === params.jobname
                    ? 'bg-base-300 border-base-content/75 sticky top-4 bottom-4 shadow-lg'
                    : 'hover:bg-base-200 border-base-content/25'
                )}
              >
                <span className="text-xl font-bold group-hocus:underline break-all font-display">
                  {job.jobname}
                </span>
                <span className="flex justify-between items-center">
                  <span className="font-mono">{job.schedule}</span>
                  <span
                    className={cx(
                      'font-bold inline-flex items-center space-x-1',
                      job.active ? 'text-success' : 'text-error'
                    )}
                  >
                    <Icon className="w-4 h-4 fill-current" />
                    <span className="font-display">
                      {job.active ? 'ACTIVE' : 'INACTIVE'}
                    </span>
                  </span>
                </span>
              </Link>
            )
          })}
        </div>
      </div>
      <div className="lg:col-span-2">
        <Outlet context={{ jobsByName }} />
      </div>
    </Bleed>
  )
}

export default SupacronJobs
