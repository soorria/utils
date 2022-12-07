import { Component } from 'solid-js'
import { ACTION_FIELD } from './common'

export const ActionMethodInput: Component<{ action: string }> = props => (
  <input type="hidden" name={ACTION_FIELD} value={props.action} />
)
export const getActionFromFormData = (formdata: FormData) =>
  formdata.get(ACTION_FIELD)
