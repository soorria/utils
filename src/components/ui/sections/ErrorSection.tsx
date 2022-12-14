import { mergeProps, ParentComponent } from 'solid-js'
import { cx } from '~/lib/utils'
import type { SectionVariant } from './common-types'
import {
  classes,
  defaultSectionVariant,
  getRootClassForVariant,
} from './styles'

const ErrorSection: ParentComponent<{
  title?: string
  utilSlug: string
  variant?: SectionVariant
  scrollOnMount?: boolean
}> = _props => {
  const props = mergeProps(
    {
      title: 'something went wrong :(',
      variant: defaultSectionVariant,
    },
    _props
  )

  // const ref = useScrollIntoViewOnMount()
  return (
    <div
      // ref={scrollOnMount ? ref : undefined}
      class={cx(getRootClassForVariant(props.variant), 'border-error')}
    >
      <h2 class={cx(classes.title, 'text-error')}>{props.title}</h2>

      <div class={cx(classes.childrenWrapper)}>{props.children}</div>

      <p class={cx(classes.footer)}>
        <a
          href={`https://soorria.com/?ref=Utils&utm_medium=ErrorLink&utm_content=${props.utilSlug}#contact`}
          target="_blank"
          rel="noopener noreferrer"
          class="hover:underline group focus-outline px-2"
        >
          If this is unexpected,{' '}
          <span class="underline group-hover:no-underline">let me know</span>{' '}
          what happened.
        </a>
      </p>
    </div>
  )
}

export default ErrorSection
