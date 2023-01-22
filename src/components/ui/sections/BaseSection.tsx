import {
  children,
  ComponentProps,
  JSXElement,
  mergeProps,
  ParentComponent,
  Show,
  splitProps,
} from 'solid-js'
import { cx } from '~/lib/utils'
import type { SectionVariant } from './common-types'
import {
  classes,
  defaultSectionVariant,
  getRootClassForVariant,
} from './styles'

const BaseSection: ParentComponent<
  { title?: JSXElement; variant?: SectionVariant } & Omit<
    ComponentProps<'div'>,
    'title'
  >
> = props => {
  const [local, delegated] = splitProps(
    mergeProps({ variant: defaultSectionVariant }, props),
    ['variant', 'class', 'title', 'children']
  )
  return (
    <div
      class={cx(getRootClassForVariant(local.variant), local.class)}
      {...delegated}
    >
      <Show when={local.title}>
        <h2 class={cx(classes.title, 'text-primary')}>{local.title}</h2>
      </Show>

      <div class={cx(classes.childrenWrapper)}>{local.children}</div>
    </div>
  )
}

export default BaseSection
