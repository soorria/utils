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
> = _props => {
  const [local, props] = splitProps(
    mergeProps({ variant: defaultSectionVariant }, _props),
    ['variant', 'class', 'title', 'children']
  )
  return (
    <div
      class={cx(getRootClassForVariant(local.variant), local.class)}
      {...props}
    >
      <Show when={local.title}>
        <h2 class={cx(classes.title, 'text-primary')}>{local.title}</h2>
      </Show>

      <div class={cx(classes.childrenWrapper)}>{local.children}</div>
    </div>
  )
}

export default BaseSection
