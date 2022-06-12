import { ACTION_FIELD } from './common'

export const ActionMethodInput: React.FC<{ action: string }> = ({ action }) => (
  <input type="hidden" name={ACTION_FIELD} value={action} />
)
export const getActionFromFormData = (formdata: FormData) => formdata.get(ACTION_FIELD)
