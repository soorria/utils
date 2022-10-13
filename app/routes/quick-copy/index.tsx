import { useMemo, useState } from 'react'
import { PlusIcon } from '@heroicons/react/outline'

import BaseForm from '~/components/ui/BaseForm'
import FormLabel from '~/components/ui/forms/FormLabel'
import BaseSection from '~/components/ui/sections/BaseSection'
import SubmitButton from '~/components/ui/SubmitButton'
import { getSlugForGroupName, useQuickCopyStore } from '~/lib/quick-copy'
import {
  CopyBar,
  CreateStringForm,
  StringItemCard,
} from '~/lib/quick-copy/components'
import Input from '~/components/ui/forms/Input'
import BaseLink from '~/components/BaseLink'
import Checkbox from '~/components/ui/forms/Checkbox'
import type { HeadersFunction } from 'remix'

export const headers: HeadersFunction = () => {
  return {
    'Cache-Control': 'public, s-maxage=31536000',
  }
}

const IDS = {
  text: 'string-text',
  groupNameInput: 'group-name-input',
  groupNameError: 'group-name-error',
  clearAfterCopyInput: 'clear-after-copy-input',
}

const QuickCopyIndex: React.FC = () => {
  const { ungrouped, createGroup, canCreateGroup } = useQuickCopyStore()
  const groups = useQuickCopyStore(s => Object.values(s.groups))
  const [groupName, setGroupName] = useState('')
  const isUnusableGroupname = Boolean(groupName) && !canCreateGroup(groupName)

  const [selected, setSelected] = useState<string[]>([])
  const selectedSet = useMemo(() => new Set(selected), [selected])

  const numSelectedInUngrouped = ungrouped.filter(s =>
    selectedSet.has(s.id)
  ).length

  const ungroupedIndeterminate =
    numSelectedInUngrouped > 0 && numSelectedInUngrouped < ungrouped.length
  const ungroupedChecked =
    numSelectedInUngrouped > 0 && numSelectedInUngrouped === ungrouped.length

  return (
    <>
      <CreateStringForm groupSlug={null} textareaId={IDS.text} />
      {ungrouped.length ? (
        <BaseSection
          variant="DEFAULT"
          className="border-primary"
          title={
            <span className="flex items-center space-x-4">
              <label className="flex items-center">
                <span className="sr-only">
                  Toggle selected for ungrouped strings
                </span>
                <Checkbox
                  className="checkbox checkbox-primary"
                  checked={ungroupedChecked}
                  indeterminate={ungroupedIndeterminate}
                  onChange={() => {
                    const ids = ungrouped.map(s => s.id)
                    const groupStringIdSet = new Set(ids)
                    if (ungroupedChecked || ungroupedIndeterminate) {
                      setSelected(selected =>
                        selected.filter(id => !groupStringIdSet.has(id))
                      )
                    } else {
                      setSelected(selected => [...selected, ...ids])
                    }
                  }}
                />
              </label>
              <span>Ungrouped Strings</span>
            </span>
          }
        >
          {ungrouped.map(it => (
            <StringItemCard
              key={it.id}
              item={it}
              groupSlug={null}
              selected={selectedSet.has(it.id)}
              onSelectedChange={checked => {
                if (checked) {
                  setSelected(selected => [...selected, it.id])
                } else {
                  setSelected(selected => selected.filter(id => id !== it.id))
                }
              }}
            />
          ))}
        </BaseSection>
      ) : null}
      {groups.map(g => {
        const numSelectedInGroup = g.strings.filter(s =>
          selectedSet.has(s.id)
        ).length

        const indeterminate =
          numSelectedInGroup > 0 && numSelectedInGroup < g.strings.length
        const checked =
          numSelectedInGroup > 0 && numSelectedInGroup === g.strings.length

        return (
          <BaseSection
            key={g.slug}
            variant="DEFAULT"
            className="border-primary"
            title={
              <span className="flex items-center space-x-4">
                <label className="flex items-center">
                  <span className="sr-only">
                    Toggle selected in group {g.name}
                  </span>
                  <Checkbox
                    disabled={g.strings.length === 0}
                    className="checkbox checkbox-primary"
                    onChange={() => {
                      const ids = g.strings.map(s => s.id)
                      const groupStringIdSet = new Set(ids)
                      if (indeterminate || checked) {
                        setSelected(selected =>
                          selected.filter(id => !groupStringIdSet.has(id))
                        )
                      } else {
                        setSelected(selected => [...selected, ...ids])
                      }
                    }}
                    checked={checked}
                    indeterminate={indeterminate}
                  />
                </label>
                <span>{g.name}</span>
              </span>
            }
          >
            {g.strings.map(it => (
              <StringItemCard
                key={it.id}
                item={it}
                groupSlug={g.slug}
                selected={selectedSet.has(it.id)}
                onSelectedChange={checked => {
                  if (checked) {
                    setSelected(selected => [...selected, it.id])
                  } else {
                    setSelected(selected => selected.filter(id => id !== it.id))
                  }
                }}
              />
            ))}

            {g.strings.length === 0 && (
              <div className="p-4 sm:px-6 bg-base-300 grid place-items-center rounded-box">
                No strings in this group
              </div>
            )}

            <div className="grid place-items-center">
              <BaseLink to={g.slug} className="btn btn-link btn-sm">
                See only group {g.name}'s strings
              </BaseLink>
            </div>
          </BaseSection>
        )
      })}

      <BaseForm
        onSubmit={e => {
          e.preventDefault()
          const groupName = new FormData(e.currentTarget).get('groupName')
          if (typeof groupName !== 'string') return
          const success = createGroup(groupName)
          if (success) {
            setGroupName('')
            e.currentTarget.reset()
          }
        }}
      >
        <BaseSection
          title={
            <label
              htmlFor={IDS.groupNameInput}
              className="flex items-center space-x-4"
            >
              <PlusIcon className="w-6 h-6" />
              <span>Create a new group</span>
            </label>
          }
          variant="DEFAULT"
          className="border-primary border-dashed"
        >
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {isUnusableGroupname && (
              <div id={IDS.groupNameError} className="text-sm col-span-full">
                Group name slug (<code>{getSlugForGroupName(groupName)}</code>)
                must be unique and contain at least 1 non-whitespace character.
              </div>
            )}
            <FormLabel className="sr-only" htmlFor={IDS.groupNameInput}>
              Group Name
            </FormLabel>
            <Input
              required
              type="text"
              onChange={e => setGroupName(e.currentTarget.value)}
              name="groupName"
              className="w-full block flex-1 sm:col-span-2"
              placeholder="Group Name"
              id={IDS.groupNameInput}
            />
            <SubmitButton className="btn-block">Create Group</SubmitButton>
          </div>
        </BaseSection>
      </BaseForm>
      <CopyBar
        selectedSet={selectedSet}
        getStrings={() =>
          [
            ...ungrouped.filter(s => selectedSet.has(s.id)),
            ...groups.flatMap(g =>
              g.strings.filter(s => selectedSet.has(s.id))
            ),
          ].map(s => s.text)
        }
        onClear={() => setSelected([])}
      />
    </>
  )
}

export default QuickCopyIndex
