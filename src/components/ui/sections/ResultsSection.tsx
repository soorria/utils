import { mergeProps, ParentComponent } from 'solid-js'
import { cx } from '~/lib/utils'
import type { SectionVariant } from './common-types'
import {
  classes,
  defaultSectionVariant,
  getRootClassForVariant,
} from './styles'

const ResultsSection: ParentComponent<{
  title?: string
  utilSlug: string
  variant?: SectionVariant
  scrollOnMount?: boolean
}> = _props => {
  const props = mergeProps(
    {
      title: 'your results',
      variant: defaultSectionVariant,
    },
    _props
  )
  // const ref = useScrollIntoViewOnMount()

  return (
    <div
      // ref={scrollOnMount ? ref : undefined}
      class={cx(getRootClassForVariant(props.variant), 'border-success')}
    >
      <h2 class={cx(classes.title, 'text-success')}>{props.title}</h2>

      <div class={cx(classes.childrenWrapper)}>{props.children}</div>

      <p class={cx(classes.footer)}>
        <a
          href={`https://soorria.com/?ref=Utils&utm_medium=SuccessLink&utm_content=${props.utilSlug}#contact`}
          target="_blank"
          rel="noopener noreferrer"
          class="hover:underline group focus-outline px-2"
        >
          <span class="underline group-hover:no-underline">Let me know</span> if
          these results look off
        </a>
      </p>
    </div>
  )
}

export default ResultsSection
