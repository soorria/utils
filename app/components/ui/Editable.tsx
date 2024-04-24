import * as editable from '@zag-js/editable'
import { useMachine, normalizeProps } from '@zag-js/react'

export const useEditable = (ctx: editable.Context) => {
  const [state, send] = useMachine(editable.machine(ctx))
  const api = editable.connect(state, send, normalizeProps)
  return { api }
}
