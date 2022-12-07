export type CronJob = {
  jobid: string
  schedule: string
  command: string
  database: string
  username: string
  active: boolean
  jobname: string
}

export type CronJobRunDetails = {
  jobid: number
  runid: number
  command: number
  status: 'starting' | 'running' | 'sending' | 'connecting' | 'succeeded' | 'failed'
}
