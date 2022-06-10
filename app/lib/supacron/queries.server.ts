import type { Client, QueryConfig } from 'pg'

type QueryFunction<Result, Arg = never> = (
  client: Client,
  ...args: Arg extends never ? [] : [Arg]
) => Promise<Result>

export const checkPgCronExtension: QueryFunction<boolean, never> = async client => {
  const QUERY: QueryConfig<never[]> = {
    name: 'check-pg-cron',
    text: `
      select name, comment, default_version, installed_version
      from pg_available_extensions
      where name = 'pg_cron';
    `,
  }
  const result = await client.query(QUERY)
  return result.rowCount >= 1
}

export const getAllCronJobs: QueryFunction<any, never> = async client => {
  const QUERY: QueryConfig = {
    name: 'get-cron-jobs',
    text: `select * from crob.job;`,
  }
  const result = await client.query(QUERY)
  return result.rows
}

export const getCronJobByName: QueryFunction<any, { name: string }> = async (client, { name }) => {
  const QUERY: QueryConfig<[string]> = {
    name: 'get-job-run-details-by-job-id',
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

export const getCronJobById: QueryFunction<any, { id: string }> = async (client, { id }) => {
  const QUERY: QueryConfig<[string]> = {
    name: 'get-job-run-details-by-job-id',
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

export const getCronJobRunDetailsByJobId: QueryFunction<any, { id: string }> = async (
  client,
  { id }
) => {
  const QUERY: QueryConfig<[string]> = {
    name: 'get-job-run-details-by-job-id',
    text: `
      select * 
      from cron.job_run_details 
      where jobid = $1;
    `,
    values: [id],
  }
  const result = await client.query(QUERY)
  return result.rows
}

export const createOrUpdateCronJob: QueryFunction<
  any,
  { name: string; schedule: string; body: string }
> = async (client, { name, schedule, body }) => {
  const QUERY: QueryConfig<[string, string, string]> = {
    name: 'create-cron-job',
    text: `select cron.schedule($1, $2, $3);`,
    values: [name, schedule, body],
  }
  const result = await client.query(QUERY)
  return result.rows[0] || null
}
