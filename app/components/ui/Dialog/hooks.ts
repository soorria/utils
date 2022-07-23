import * as dialog from '@zag-js/dialog'
import { useMachine, normalizeProps } from '@zag-js/react'

export type DialogApi = ReturnType<typeof dialog.connect>

export const useDialog = (ctx: dialog.Context) => {
  const [state, send] = useMachine(dialog.machine(ctx))
  const api = dialog.connect(state, send, normalizeProps)

  return { api }
}
