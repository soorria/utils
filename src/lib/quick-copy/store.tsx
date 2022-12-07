import cuid from 'cuid'
import type { Provider } from 'react'
import slugify from 'slugify'
import create from 'zustand'
import createContext from 'zustand/context'
import { persist } from 'zustand/middleware'

export type StringItem = {
  text: string
  id: string
}

export type Group = {
  name: string
  slug: string
  strings: StringItem[]
}

export type Store = {
  ungrouped: StringItem[]
  groups: Record<string, Group>
  separator: string
  setSeparator: (sep: string) => void
  getSeparatedString: (strings: string[]) => string

  canCreateGroup: (name: string) => boolean
  createGroup: (name: string) => boolean
  getGroup: (slug: string) => Group | null
  renameGroup: (slug: string, newName: string) => boolean
  deleteGroup: (slug: string) => void

  __addStringItem: (item: StringItem, groupSlug: string | null) => boolean
  createString: (text: string, groupSlug: string | null) => boolean
  updateString: (
    id: string,
    groupSlug: string | null,
    newText: string
  ) => boolean
  moveString: (
    id: string,
    fromGroupSlug: string | null,
    toGroupSlug: string | null
  ) => boolean
  deleteString: (id: string, groupSlug: string | null) => boolean
}

const KEY = 'utils:copy-strings'

const createStore = () =>
  create(
    persist<Store>(
      (set, get) => ({
        ungrouped: [] as StringItem[],
        groups: {} as Store['groups'],
        separator: '\\n',
        getSeparatedString: (strings: string[]) => {
          return strings.join(
            get().separator.replace('\\n', '\n').replace('\\t', '\t')
          )
        },
        setSeparator: sep => {
          set({
            separator: sep,
          })
        },

        canCreateGroup: name => {
          name = name.trim()
          return Boolean(name) && !get().groups[getSlugForGroupName(name)]
        },
        createGroup: name => {
          if (!get().canCreateGroup(name)) return false
          const slug = getSlugForGroupName(name)
          set(state => ({
            groups: { ...state.groups, [slug]: createGroupObject(name, slug) },
          }))
          return true
        },
        getGroup: slug => get().groups[slug] ?? null,
        renameGroup: (slug, newName) => {
          const group = get().getGroup(slug)

          if (!group) return false

          set(state => ({
            groups: { ...state.groups, [slug]: { ...group, name: newName } },
          }))

          return true
        },
        deleteGroup: slug => {
          set(state => {
            const groups = { ...state.groups }
            delete groups[slug]
            return { groups }
          })
        },

        createString: (text, groupSlug) => {
          if (!text) return false
          return get().__addStringItem(createStringItem(text), groupSlug)
        },
        __addStringItem: (
          item: StringItem,
          groupSlug: string | null
        ): boolean => {
          if (groupSlug) {
            const group = get().groups[groupSlug]
            if (!group) return false
            set(state => ({
              groups: {
                ...state.groups,
                [groupSlug]: { ...group, strings: [...group.strings, item] },
              },
            }))
          } else {
            set(state => ({ ungrouped: [...state.ungrouped, item] }))
          }
          return true
        },
        updateString: (id, groupSlug, newText) => {
          const mapFn = (s: StringItem): StringItem =>
            s.id === id ? { ...s, text: newText } : s
          if (groupSlug) {
            const group = get().groups[groupSlug]
            if (!group) return false
            set(state => ({
              groups: {
                ...state.groups,
                [groupSlug]: {
                  ...group,
                  strings: group.strings.map(mapFn),
                },
              },
            }))
          } else {
            set(state => ({ ungrouped: state.ungrouped.map(mapFn) }))
          }
          return true
        },
        moveString: (id, fromGroupSlug, toGroupSlug) => {
          console.log({ fromGroupSlug, toGroupSlug })
          if (fromGroupSlug === toGroupSlug) return true
          const { deleteString, getGroup, ungrouped } = get()
          const item = fromGroupSlug
            ? getGroup(fromGroupSlug)?.strings.find(s => s.id === id)
            : ungrouped.find(s => s.id === id)
          if (!item) return false
          return (
            deleteString(id, fromGroupSlug) &&
            get().__addStringItem(item, toGroupSlug)
          )
        },
        deleteString: (id, groupSlug) => {
          const filterFn = (s: StringItem) => s.id !== id
          if (groupSlug) {
            const group = get().groups[groupSlug]
            if (!group) return false
            set(state => ({
              groups: {
                ...state.groups,
                [groupSlug]: {
                  ...group,
                  strings: group.strings.filter(filterFn),
                },
              },
            }))
          } else {
            set(state => ({
              ungrouped: state.ungrouped.filter(s => s.id !== id),
            }))
          }
          return true
        },
      }),
      {
        name: KEY,
        version: 1,
      }
    )
  )

const createStringItem = (text: string): StringItem => ({ text, id: cuid() })
const createGroupObject = (name: string, slug: string): Group => ({
  name,
  slug,
  strings: [],
})

export const getSlugForGroupName = (name: string) => slugify(name)

const {
  Provider,
  useStore: useQuickCopyStore,
  useStoreApi: useQuickCopyStoreApi,
} = createContext<ReturnType<typeof createStore>>()

export const QuickCopyProvider: React.FC = props => {
  return <Provider createStore={createStore}>{props.children}</Provider>
}
export { useQuickCopyStore, useQuickCopyStoreApi }
