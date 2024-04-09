import type { Client, QueryConfig } from 'pg'
import type { CronJob, CronJobRunDetails } from './types'

type QueryFunction<Result, Arg = false> = (
  client: Client,
  ...args: Arg extends false ? [] : [Arg]
) => Promise<Result>

export const checkPgCronExtension: QueryFunction<
  boolean,
  false
> = async client => {
  const QUERY: QueryConfig<never[]> = {
    name: 'check-pg-cron',
    text: `
      select name, comment, default_version, installed_version
      from pg_available_extensions
      where name = 'pg_cron';
    `,
  }
  const result = await client.query(QUERY)
  return (result.rowCount ?? 0) >= 1
}

export type AllCronJobsResult = Pick<
  CronJob,
  'jobid' | 'jobname' | 'schedule' | 'active'
>[]
export const getAllCronJobs: QueryFunction<
  AllCronJobsResult,
  false
> = async client => {
  const QUERY: QueryConfig = {
    name: 'get-cron-jobs',
    text: `
      select jobid, jobname, schedule, active,username
      from "cron".job;
    `,
  }
  const result = await client.query(QUERY)
  return result.rows
}

export const getCronJobByName: QueryFunction<
  CronJob | null,
  { name: string }
> = async (client, { name }) => {
  const QUERY: QueryConfig<[string]> = {
    name: 'get-job-by-name',
    text: `
      select *
      from cron.job
      where jobname = $1;
    `,
    values: [name],
  }
  const result = await client.query(QUERY)
  return result.rows[0] || null
}

export const getCronJobById: QueryFunction<
  CronJob | null,
  { id: string }
> = async (client, { id }) => {
  const QUERY: QueryConfig<[string]> = {
    name: 'get-job-by-id',
    text: `
      select *
      from cron.job
      where jobid = $1;
    `,
    values: [id],
  }
  const result = await client.query(QUERY)
  return result.rows[0] || null
}

export const getCronJobRunDetailsByJobId: QueryFunction<
  CronJobRunDetails[],
  { id: string }
> = async (client, { id }) => {
  const QUERY: QueryConfig<[string]> = {
    name: 'get-job-run-details-by-job-id',
    text: `
      select jobid, runid, command, status 
      from cron.job_run_details 
      where jobid = $1;
    `,
    values: [id],
  }
  const result = await client.query(QUERY)
  return result.rows
}

export const createCronJob: QueryFunction<
  any,
  { name: string; schedule: string; command: string }
> = async (client, { name, schedule, command }) => {
  const QUERY: QueryConfig<[string, string, string]> = {
    name: 'create-or-update-cron-job',
    text: `select cron.schedule($1, $2, $3);`,
    values: [name, schedule, command],
  }
  const result = await client.query(QUERY)
  return result.rows[0] || null
}

export const updateCronJob: QueryFunction<
  void,
  { name: string; schedule: string; command: string; username: string }
> = async (client, { name, schedule, command, username }) => {
  const job = await getCronJobByName(client, { name })

  if (!job) return

  if (job.username !== username) {
    await deleteCronJobById(client, { id: job.jobid })
  }

  const QUERY: QueryConfig<[string, string, string]> = {
    name: 'create-or-update-cron-job',
    text: `select cron.schedule($1, $2, $3);`,
    values: [name, schedule, command],
  }
  await client.query(QUERY)
}

export const deleteCronJobById: QueryFunction<void, { id: string }> = async (
  client,
  { id }
) => {
  if (!Number.isSafeInteger(parseInt(id))) {
    return
  }

  const QUERY: QueryConfig<[]> = {
    name: 'delete-cron-job',
    text: `select "cron".unschedule(${id})`,
  }

  try {
    await client.query(QUERY)
  } catch (err) {
    console.dir(err, { depth: Infinity })
    throw err
  }
}

export const deleteCronJobByName: QueryFunction<
  void,
  { name: string }
> = async (client, { name }) => {
  const job = await getCronJobByName(client, { name })
  if (!job) {
    return
  }
  return deleteCronJobById(client, { id: job.jobid })
}
