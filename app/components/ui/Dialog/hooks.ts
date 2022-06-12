import * as dialog from '@zag-js/dialog'
import { useMachine, useSetup } from '@zag-js/react'

type UseDialogProps = Partial<dialog.Context> & {
  id: string
}

export type DialogApi = ReturnType<typeof dialog.connect>

export const useDialog = <TTriggerElement extends HTMLElement = HTMLButtonElement>({
  id,
  ...ctx
}: UseDialogProps) => {
  const [state, send] = useMachine(dialog.machine(ctx))
  const ref = useSetup<TTriggerElement>({ send, id })
  const api = dialog.connect(state, send)

  return { ref, api }
}
