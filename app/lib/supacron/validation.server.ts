import cron from 'cron-validate'
import { z } from 'zod'

const nonStandardCronSchedules = new Set([
  '@reboot',
  '@restart',
  '@yearly',
  '@annually',
  '@monthly',
  '@weekly',
  '@daily',
  '@hourly',
])

export const createCronJobSchema = z.object({
  name: z.string().min(1, { message: 'name must be at least 1 character long' }),
  schedule: z
    .string()
    .trim()
    .refine(str => {
      if (nonStandardCronSchedules.has(str)) return true
      const cronResult = cron(str, {
        preset: 'default',
        useSeconds: false,
      })
      return cronResult.isValid()
    }, 'invalid cron schedule'),
  command: z.string().min(1, {
    message: 'command must be at least 1 character long but should probably be longer to be useful',
  }),
})

export type CreateCronJobSchema = z.infer<typeof createCronJobSchema>
export type CreateCronJobSchemaErrors = z.inferFlattenedErrors<typeof createCronJobSchema>

export const updateCronJobSchema = createCronJobSchema.omit({ name: true })

export type UpdateCronJobSchema = z.infer<typeof updateCronJobSchema>
export type UpdateCronJobSchemaErrors = z.inferFlattenedErrors<typeof updateCronJobSchema>
