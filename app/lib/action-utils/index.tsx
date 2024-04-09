import { ACTION_FIELD } from './common'

export const ActionMethodInput = ({ action }: { action: string }) => (
  <input type="hidden" name={ACTION_FIELD} value={action} />
)
export const getActionFromFormData = (formdata: FormData) =>
  formdata.get(ACTION_FIELD)
