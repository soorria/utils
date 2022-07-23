import { useMemo, useState } from 'react'
import { HeadersFunction, useNavigate, useParams } from 'remix'
import BaseLink from '~/components/BaseLink'
import Dialog, {
  DialogActions,
  DialogBox,
  DialogCloseAction,
  DialogDescription,
  DialogHeading,
  useDialog,
} from '~/components/ui/Dialog'
import Checkbox from '~/components/ui/forms/Checkbox'
import { CopyBar, CreateStringForm, StringItemCard, useQuickCopyStore } from '~/lib/quick-copy'

export const headers: HeadersFunction = () => {
  return {
    'Cache-Control': 'public, s-maxage=31536000',
  }
}

const QuickCopySingleGroup: React.FC = () => {
  const { slug } = useParams<{ slug: string }>()
  const [getGroup, deleteGroup] = useQuickCopyStore(s => [s.getGroup, s.deleteGroup])
  const group = useMemo(() => (slug ? getGroup(slug) : null), [slug, getGroup])
  const navigate = useNavigate()

  const [selected, setSelected] = useState<string[]>([])
  const selectedSet = useMemo(() => new Set(selected), [selected])

  const deleteDialog = useDialog({
    id: `delete-group-${slug}`,
  })

  const backLink = (
    <div>
      <BaseLink className="link mb-4 link-hover inline-block" to="..">
        &larr; Back to all groups
      </BaseLink>
    </div>
  )

  if (!group || !slug)
    return (
      <div className="space-y-6">
        {backLink}
        <h3 className="text-primary text-3xl">
          Group with slug <code>'{slug}'</code> not found
        </h3>
      </div>
    )

  const numSelected = group.strings.filter(s => selectedSet.has(s.id)).length

  const indeterminate = numSelected > 0 && numSelected < group.strings.length
  const checked = numSelected > 0 && numSelected === group.strings.length

  return (
    <div className="space-y-6">
      {backLink}
      <h3 className="text-primary text-3xl">
        <label className="flex items-center space-x-4 cursor-pointer">
          <Checkbox
            className="checkbox checkbox-primary"
            checked={checked}
            indeterminate={indeterminate}
            onChange={() => {
              const ids = group.strings.map(s => s.id)
              const groupStringIdSet = new Set(ids)
              if (checked || indeterminate) {
                setSelected(selected => selected.filter(id => !groupStringIdSet.has(id)))
              } else {
                setSelected(selected => [...selected, ...ids])
              }
            }}
          />
          <span>{group.name}</span>
        </label>
      </h3>

      {group.strings.map(s => (
        <StringItemCard
          key={s.id}
          groupSlug={slug}
          item={s}
          selected={selectedSet.has(s.id)}
          onSelectedChange={checked => {
            if (checked) {
              setSelected(selected => [...selected, s.id])
            } else {
              setSelected(selected => selected.filter(id => id !== s.id))
            }
          }}
        />
      ))}

      <CreateStringForm groupSlug={slug} textareaId={`create-string-${slug}`} />

      <CopyBar
        getCopyString={() =>
          group.strings
            .filter(s => selectedSet.has(s.id))
            .map(s => s.text)
            .join('\n')
        }
        onClear={() => setSelected([])}
        selectedSet={selectedSet}
      />

      <button
        className="btn btn-error btn-outline btn-sm btn-block"
        {...deleteDialog.api.triggerProps}
      >
        Delete this group
      </button>
      <Dialog api={deleteDialog.api}>
        <DialogBox>
          <DialogHeading>Delete {group.name} group</DialogHeading>
          <DialogDescription>
            Are you sure you want to delete this group and all of the strings inside it? This action
            cannot be undone.
          </DialogDescription>
          <DialogActions>
            <DialogCloseAction>Cancel</DialogCloseAction>
            <button
              className="btn btn-primary"
              onClick={() => {
                deleteGroup(slug)
                navigate('..')
              }}
            >
              Delete Group
            </button>
          </DialogActions>
        </DialogBox>
      </Dialog>
    </div>
  )
}

export default QuickCopySingleGroup
