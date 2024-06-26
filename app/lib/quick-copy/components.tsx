import {
  ChevronUpDownIcon as SelectorIcon,
  TrashIcon,
  PencilIcon as PencilAltIcon,
  CheckIcon,
  ClipboardDocumentIcon as ClipboardCopyIcon,
  ClipboardDocumentCheckIcon as ClipboardCheckIcon,
} from '@heroicons/react/24/outline'
import autosize from 'autosize'
import { KeyboardEvent, useEffect, useRef } from 'react'
import BaseForm from '~/components/ui/BaseForm'
import Dialog, {
  DialogActions,
  DialogBox,
  DialogCloseAction,
  DialogDescription,
  DialogHeading,
  useDialog,
} from '~/components/ui/Dialog'
import { useEditable } from '~/components/ui/Editable'
import FormControl from '~/components/ui/forms/FormControl'
import Input from '~/components/ui/forms/Input'
import FormLabel from '~/components/ui/forms/FormLabel'
import Textarea from '~/components/ui/forms/Textarea'
import SubmitButton from '~/components/ui/SubmitButton'
import { useCopy } from '../use-copy'
import { useLocalStorage } from '../use-local-storage'
import { cx, plural } from '../utils'
import { StringItem, useQuickCopyStore } from './store'

const UNGROUPED_MENU_ITEM_VALUE = '$UNGROUPED'

const classes = {
  icon: 'w-6 h-6 mx-auto',
}

export const StringItemCard = ({
  item,
  groupSlug,
  selected,
  onSelectedChange,
}: {
  item: StringItem
  groupSlug: string | null
  selected: boolean
  onSelectedChange: (selected: boolean) => void
}) => {
  const [copy, copied] = useCopy()
  const [deleteString, moveString, updateString] = useQuickCopyStore(s => [
    s.deleteString,
    s.moveString,
    s.updateString,
  ])
  const groups = useQuickCopyStore(s => Object.values(s.groups))
  const deleteDialog = useDialog({
    id: `delete-${item.id}`,
  })
  const moveDialog = useDialog({ id: `move-${item.id}` })
  const editable = useEditable({
    id: `edit-${item.id}`,
    value: item.text,
    autoResize: true,
    selectOnFocus: false,
    submitMode: 'blur',
    activationMode: 'none',
    onValueChange: details => {
      updateString(item.id, groupSlug, details.value)
    },
  })
  const textarea = useRef<HTMLTextAreaElement>(null)
  const inputId = `string-${item.id}`
  const moveSelectId = `move-select-${item.id}`
  const moveFormId = `move-form-${item.id}`

  useEffect(() => {
    const ta = textarea.current
    if (!ta || !editable.api.editing) return

    autosize(ta)

    return () => {
      autosize.destroy(ta)
    }
  }, [editable.api.editing])

  const onTextareaKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Enter') {
      return
    }
    editable.api.inputProps.onKeyDown?.(
      event as KeyboardEvent<HTMLInputElement>
    )
  }

  return (
    <label
      htmlFor={inputId}
      className="flex flex-col cursor-pointer rounded-btn focus-within-outline focus-outline p-4 sm:px-6 bg-base-200 hocus-within:bg-base-300 hover:shadow-xl"
      style={{
        '--tooltip-offset': '110%',
      }}
    >
      <span className="block mb-4" {...editable.api.areaProps}>
        <textarea
          {...(editable.api.inputProps as Record<string, unknown>)}
          onKeyDown={onTextareaKeyDown}
          style={{
            ...editable.api.inputProps.style,
            minHeight: editable.api.editing ? '4rem' : '0',
          }}
          className={cx(
            '!text-base-content !rounded-btn !h-auto',
            editable.api.editing && '!bg-base-100'
          )}
          rows={0}
        />
        <span
          {...editable.api.previewProps}
          className="!overflow-visible"
          style={{
            ...editable.api.previewProps.style,
            textOverflow: 'unset',
            whiteSpace: 'pre-wrap',
          }}
        />
      </span>
      <span className="flex items-center space-x-4">
        <input
          type="checkbox"
          className="checkbox checkbox-primary checkbox-sm"
          id={inputId}
          checked={selected}
          onChange={event => onSelectedChange(event.currentTarget.checked)}
          value={item.id}
        />
        <span className="flex-1" />

        {editable.api.editing ? (
          <button
            type="button"
            className="btn btn-ghost btn-square btn-sm tooltip tooltip-fade-up"
            {...editable.api.submitTriggerProps}
            aria-label="Save changes"
            onClick={event => {
              event.preventDefault()
              editable.api.submitTriggerProps.onClick?.(event)
            }}
          >
            <CheckIcon className={classes.icon} />
          </button>
        ) : (
          <button
            type="button"
            className="btn btn-ghost btn-square btn-sm tooltip"
            {...editable.api.editTriggerProps}
            aria-label="Edit string"
            onClick={event => {
              event.preventDefault()
              editable.api.editTriggerProps.onClick?.(event)
            }}
          >
            <PencilAltIcon className={classes.icon} />
          </button>
        )}

        <button
          type="button"
          title="Copy string to clipboard"
          className={cx('btn btn-ghost btn-square btn-sm tooltip')}
          aria-label={copied ? 'Copied' : 'Copy string'}
          onClick={() => copy(item.text)}
        >
          <span className={cx('swap', copied && 'swap-active')}>
            <span className="swap-on">
              <ClipboardCheckIcon
                className={cx(classes.icon, 'text-success')}
              />
            </span>
            <span className="swap-off">
              <ClipboardCopyIcon className={classes.icon} />
            </span>
          </span>
        </button>

        <button
          type="button"
          aria-label="Move to another group"
          className="btn btn-ghost btn-square btn-sm tooltip"
          {...moveDialog.api.triggerProps}
        >
          <SelectorIcon className={classes.icon} />
        </button>
        <Dialog api={moveDialog.api}>
          <DialogBox>
            <DialogHeading>Move this string?</DialogHeading>
            <BaseForm
              id={moveFormId}
              onSubmit={e => {
                e.preventDefault()
                const toGroupSlug = new FormData(e.currentTarget).get('toGroup')
                if (typeof toGroupSlug !== 'string') return
                const success = moveString(
                  item.id,
                  groupSlug,
                  toGroupSlug === UNGROUPED_MENU_ITEM_VALUE ? null : toGroupSlug
                )
                if (success) moveDialog.api.setOpen(false)
              }}
            >
              <FormControl>
                <FormLabel
                  htmlFor={moveSelectId}
                  {...moveDialog.api.descriptionProps}
                >
                  Which group do you want to move this string to?
                </FormLabel>
                <select
                  name="toGroup"
                  defaultValue={groupSlug ?? UNGROUPED_MENU_ITEM_VALUE}
                  className="select select-bordered w-full"
                >
                  <option value={UNGROUPED_MENU_ITEM_VALUE}>
                    None - Remove from groups
                  </option>
                  {groups.map(g => (
                    <option key={g.slug}>{g.name}</option>
                  ))}
                </select>
              </FormControl>
            </BaseForm>
            <DialogActions>
              <DialogCloseAction>Cancel</DialogCloseAction>
              <button className="btn btn-primary" form={moveFormId}>
                Move
              </button>
            </DialogActions>
          </DialogBox>
        </Dialog>

        <button
          type="button"
          className="btn btn-ghost btn-square btn-sm tooltip"
          {...deleteDialog.api.triggerProps}
          aria-label="Delete"
        >
          <TrashIcon className={classes.icon} />
        </button>

        <Dialog api={deleteDialog.api}>
          <DialogBox>
            <DialogHeading>Delete this string?</DialogHeading>
            <DialogDescription>
              Are you sure you want to delete this string? This action cannot be
              undone.
            </DialogDescription>
            <DialogActions>
              <DialogCloseAction>Cancel</DialogCloseAction>
              <button
                className="btn btn-primary"
                onClick={() => deleteString(item.id, groupSlug)}
              >
                Delete
              </button>
            </DialogActions>
          </DialogBox>
        </Dialog>
      </span>
    </label>
  )
}

export const CreateStringForm = ({
  groupSlug,
  textareaId,
}: {
  groupSlug: string | null
  textareaId: string
}) => {
  const createString = useQuickCopyStore(s => s.createString)
  const textarea = useRef<HTMLTextAreaElement>(null)

  const handleSubmitForForm = (form: HTMLFormElement) => {
    const text = new FormData(form).get('text')
    if (typeof text !== 'string') return

    const success = createString(text, groupSlug)
    if (success) {
      form.reset()
      textarea.current?.focus()
    }
  }

  return (
    <BaseForm
      onSubmit={event => {
        event.preventDefault()
        handleSubmitForForm(event.currentTarget)
      }}
    >
      <FormControl>
        <FormLabel htmlFor={textareaId} className="sr-only">
          Text
        </FormLabel>
        <Textarea
          required
          placeholder="Text (ctrl+enter or cmd+enter)"
          id={textareaId}
          name="text"
          ref={textarea}
          onKeyDown={event => {
            if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) {
              const form = event.currentTarget.closest('form')
              if (form) handleSubmitForForm(form)
            }
          }}
        />
        <SubmitButton className="btn-sm">Add a string</SubmitButton>
      </FormControl>
    </BaseForm>
  )
}

export const CopyBar = ({
  selectedSet,
  onClear,
  getStrings,
}: {
  selectedSet: Set<string>
  onClear: () => void
  getStrings: () => string[]
}) => {
  const clearAfterCopyInput = 'clear-after-copy'
  const separatorInput = 'separator'
  const [clearAfterCopy, setClearAfterCopy] = useLocalStorage(
    'utils:copy-clear',
    false
  )
  const separator = useQuickCopyStore(s => s.separator)
  const [getSeparatedString, setSeparator] = useQuickCopyStore(s => [
    s.getSeparatedString,
    s.setSeparator,
  ])
  const [copy, copied] = useCopy()
  return (
    <>
      <div>
        <FormControl variant="INLINE">
          <FormLabel htmlFor={clearAfterCopyInput} className="flex-1">
            Clear selection after copying
          </FormLabel>
          <input
            id={clearAfterCopyInput}
            type="checkbox"
            className="toggle toggle-primary"
            checked={clearAfterCopy}
            onChange={e => setClearAfterCopy(e.currentTarget.checked)}
          />
        </FormControl>
      </div>
      <div>
        <FormControl variant="INLINE">
          <FormLabel htmlFor={clearAfterCopyInput} className="flex-1">
            Separator
          </FormLabel>
          <Input
            id={separatorInput}
            type="text"
            className=""
            defaultValue={separator}
            onChange={e => setSeparator(e.currentTarget.value)}
          />
        </FormControl>
      </div>
      <div
        className={cx(
          'bottom-0 flex -m-4 py-4 rounded-box',
          selectedSet.size > 0
            ? 'sticky bg-gradient-to-t from-base-100 to-transparent px-6'
            : 'px-4'
        )}
      >
        <button
          className="btn space-x-2"
          disabled={selectedSet.size === 0}
          onClick={() => onClear()}
        >
          Clear Selection
        </button>
        <div className="flex-1" />
        <button
          className="btn btn-primary"
          disabled={selectedSet.size === 0}
          onClick={async () => {
            await copy(getSeparatedString(getStrings()))
            if (clearAfterCopy) onClear()
          }}
        >
          <span
            className={cx('swap place-items-center', copied && 'swap-active')}
          >
            <span className="swap-off inline-flex space-x-2 items-center">
              <ClipboardCopyIcon className="w-6 h-6" />
              <span>
                Copy {selectedSet.size}{' '}
                {plural(selectedSet.size, 'string', 'strings')}
              </span>
            </span>
            <span className="swap-on inline-flex space-x-2 items-center">
              <ClipboardCheckIcon className="w-6 h-6 text-success" />
              <span>Copied</span>
            </span>
          </span>
        </button>
      </div>
    </>
  )
}
