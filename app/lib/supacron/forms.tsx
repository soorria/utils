import BaseForm from '~/components/ui/BaseForm'
import FormControl from '~/components/ui/forms/FormControl'
import FormErrorMessage from '~/components/ui/forms/FormErrorMessage'
import FormLabel from '~/components/ui/forms/FormLabel'
import Input from '~/components/ui/forms/Input'
import ResetButton from '~/components/ui/ResetButton'
import SubmitButton from '~/components/ui/SubmitButton'
import CodeMirrorTextarea from '~/components/ui/forms/CodeMirrorTextarea'

if (typeof window !== 'undefined') {
  require('codemirror/mode/sql/sql')
}

type Fields = 'name' | 'schedule' | 'command'

interface CronJobFormProps {
  fields: Record<Fields, boolean>
  defaultValues?: Partial<Record<Fields, string>>
  errors?: Partial<Record<Fields, string | null>>
  isSubmitting?: boolean
  submitText: string
  cancelText: string
  cancelHref: string
}

const IDS = {
  nameInput: 'name',
  nameError: 'name-error',
  scheduleInput: 'schedule',
  scheduleError: 'schedule-error',
  commandInput: 'command',
  commandError: 'command-error',
}

export const CronJobForm = ({
  defaultValues,
  errors,
  isSubmitting,
  submitText,
  cancelText,
  fields,
  cancelHref,
}: CronJobFormProps) => {
  return (
    <BaseForm replace={false} method="post" className="space-y-6">
      {fields.name && (
        <FormControl>
          <FormLabel required htmlFor={IDS.nameInput}>
            Job Name
          </FormLabel>
          <Input
            id={IDS.nameInput}
            name="name"
            defaultValue={defaultValues?.name}
            aria-errormessage={errors?.name ? IDS.nameError : undefined}
            required
            disabled={isSubmitting}
            placeholder="do the thing all the time"
          />
          {errors?.name ? (
            <FormErrorMessage id={IDS.nameError}>
              {errors.name}
            </FormErrorMessage>
          ) : null}
          <FormLabel htmlFor={IDS.nameInput} variant="ALT">
            This needs to be unique across all jobs in the database.
          </FormLabel>
        </FormControl>
      )}

      {fields.schedule && (
        <FormControl>
          <FormLabel required htmlFor={IDS.scheduleInput}>
            Cron Schedule
          </FormLabel>
          <Input
            id={IDS.scheduleInput}
            name="schedule"
            defaultValue={defaultValues?.schedule}
            aria-errormessage={errors?.schedule ? IDS.scheduleError : undefined}
            required
            disabled={isSubmitting}
            placeholder="0 * * * *"
          />
          {errors?.schedule ? (
            <FormErrorMessage id={IDS.scheduleError}>
              {errors.schedule}
            </FormErrorMessage>
          ) : null}
          <FormLabel htmlFor={IDS.scheduleInput} variant="ALT">
            Should have 5 expressions (no seconds expression). Check out{' '}
            <a href="https://crontab.guru" className="link">
              crontab.guru
            </a>{' '}
            for a better explanation and authoring experience.
          </FormLabel>
        </FormControl>
      )}

      {fields.command && (
        <FormControl>
          <FormLabel required htmlFor={IDS.commandInput}>
            Command
          </FormLabel>
          <CodeMirrorTextarea
            defaultValue={defaultValues?.command}
            name="command"
            options={{ mode: 'sql' }}
          />
          {errors?.command ? (
            <FormErrorMessage id={IDS.commandError}>
              {errors.command}
            </FormErrorMessage>
          ) : null}
        </FormControl>
      )}

      <SubmitButton isLoading={isSubmitting}>{submitText}</SubmitButton>

      <ResetButton isLoading={isSubmitting} resetHref={cancelHref}>
        {cancelText}
      </ResetButton>
    </BaseForm>
  )
}
