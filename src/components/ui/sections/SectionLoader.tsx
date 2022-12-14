import { mergeProps, ParentComponent } from 'solid-js'
import { cx } from '~/lib/utils'
import type { SectionVariant } from './common-types'
import {
  classes,
  defaultSectionVariant,
  getRootClassForVariant,
} from './styles'

interface SectionLoaderProps {
  variant?: SectionVariant
}

const SectionLoader: ParentComponent<SectionLoaderProps> = _props => {
  const props = mergeProps({ variant: defaultSectionVariant }, _props)
  return (
    <div class={cx(getRootClassForVariant(props.variant), 'border-neutral')}>
      <h2 class={cx(classes.title, 'skeleton w-64 h-[1.2em]')} />

      <div class={cx(classes.childrenWrapper)}>{props.children}</div>

      <p class={cx(classes.footer)}>
        <span class="w-56 inline-block h-[1em] skeleton"></span>
      </p>
    </div>
  )
}

export default SectionLoader
