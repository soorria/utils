import { Transition } from '@headlessui/react'
import Portal from '@reach/portal'
import { ButtonHTMLAttributes, createContext, forwardRef, HTMLAttributes, useContext } from 'react'
import invariant from 'tiny-invariant'
import type { DialogApi } from './hooks'

export * from './hooks'

interface DialogProps {
  api: DialogApi
}

const DialogContext = createContext<DialogApi | null>(null)
const useDialogContext = () => {
  const ctx = useContext(DialogContext)
  invariant(ctx)
  return ctx
}

const Dialog: React.FC<DialogProps> = ({ api, children }) => {
  return (
    <Portal>
      <Transition show={api.isOpen}>
        <Transition.Child
          enter="transition-opacity ease-linear duration-150"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="transition-opacity ease-linear duration-150"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-neutral-focus/40" />
        </Transition.Child>

        <Transition.Child
          enterFrom="opacity-0 translate-y-16"
          enterTo="opacity-100 translate-y-0"
          leaveFrom="opacity-100 translate-y-0 scale-100"
          leaveTo="opacity-0 translate-y-16 sm:translate-y-0 sm:scale-75"
          className="flex justify-center items-end sm:items-center fixed inset-0 transition duration-150"
          {...api.underlayProps}
        >
          <DialogContext.Provider value={api}>{children}</DialogContext.Provider>
        </Transition.Child>
      </Transition>
    </Portal>
  )
}

export default Dialog

export const DialogBox = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  (props, ref) => {
    const api = useDialogContext()
    return (
      <div
        className="relative rounded-t-box sm:rounded-b-box p-6 sm:px-8 space-y-4 bg-base-100 shadow-lg"
        {...api.contentProps}
        {...props}
        ref={ref}
      />
    )
  }
)

export const DialogHeading = forwardRef<
  HTMLHeadingElement,
  HTMLAttributes<HTMLHeadingElement> & { level?: `h${2 | 3}` }
>(({ level: Component = 'h2', ...props }, ref) => {
  const api = useDialogContext()
  return <Component className="text-xl" {...api.titleProps} {...props} ref={ref} />
})

export const DialogDescription = forwardRef<
  HTMLParagraphElement,
  HTMLAttributes<HTMLParagraphElement>
>((props, ref) => {
  const api = useDialogContext()
  return <p className="text-base" {...api.descriptionProps} {...props} ref={ref} />
})

export const DialogActions = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  (props, ref) => {
    return <div className="flex justify-end space-x-2" {...props} ref={ref} />
  }
)

export const DialogCloseAction = forwardRef<
  HTMLButtonElement,
  ButtonHTMLAttributes<HTMLButtonElement>
>((props, ref) => {
  const api = useDialogContext()
  return (
    <button className="btn btn-error btn-outline" {...api.closeButtonProps} {...props} ref={ref} />
  )
})