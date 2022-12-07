import { allUtils } from '~/lib/all-utils.server'
import { Tag } from '~/lib/all-utils'
import MainLayout, { MainHeading } from '~/components/layouts/MainLayout'
import { cx } from '~/lib/utils'
import {
  Component,
  For,
  JSXElement,
  onMount,
  Show,
  VoidComponent,
  onCleanup,
} from 'solid-js'
import { CdnCacheYear } from '~/lib/headers'
import { A, useRouteData } from 'solid-start'
import { ExclamationTriangleIconSolid } from '~/components/ui/icons'

export const routeData = () => {
  return {
    utils: allUtils,
  }
}

const tagDetailsMap: Record<Tag, { class: string; label: JSXElement }> = {
  [Tag.API]: {
    class: 'badge-primary',
    label: '+ API',
  },
  [Tag.NEEDS_JS]: {
    class: 'badge-warning',
    label: 'NEEDS JS',
  },
  [Tag.WIP]: {
    class: 'badge-error',
    label: (
      <>
        <ExclamationTriangleIconSolid class="w-3 h-3 mr-1" /> WIP
      </>
    ),
  },
}
const TagBadge: Component<{ tag: Tag }> = props => {
  const details = () => tagDetailsMap[props.tag]
  return (
    <span class={cx('badge font-mono font-bold', details().class)}>
      {details().label}
    </span>
  )
}

const Index: VoidComponent = () => {
  const data = useRouteData<typeof routeData>()

  onMount(() => {
    console.log('mounting index')
  })

  onCleanup(() => {
    console.log('unmounting index')
  })

  return (
    <MainLayout>
      <CdnCacheYear />
      <MainHeading>All Utils</MainHeading>

      <p class="text-2xl">
        A bunch of micro-apps that are too small for creating a new project to
        be worth it. Some of them are useful, others less ...
      </p>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-8">
        <For each={data.utils}>
          {util => (
            <A
              href={util.path}
              class="focus-outline flex font-display flex-col space-y-4 p-4 sm:p-6 bg-base-300 rounded-btn hover:shadow-lg transition group"
            >
              <span class="text-xl font-bold transition-colors group-hover:underline">
                {util.title}
              </span>

              <span class="min-h-12">{util.description}</span>

              <Show when={util.tags?.length}>
                <div class="!-mt-0 -ml-4">
                  <For each={util.tags}>
                    {tag => (
                      <span class="inline-block ml-4 mt-4">
                        <TagBadge tag={tag} />
                      </span>
                    )}
                  </For>
                </div>
              </Show>
            </A>
          )}
        </For>
      </div>
    </MainLayout>
  )
}

export default Index
