import { cx, useScrollIntoViewOnMount } from '~/lib/utils'
import type { SectionVariant } from './common-types'
import { classes, getRootClassForVariant } from './styles'
import { ReactNode } from 'react'

const ResultsSection = ({
  title = 'your results',
  utilSlug,
  children,
  variant = 'DEFAULT',
  scrollOnMount,
}: {
  title?: string
  utilSlug: string
  variant?: SectionVariant
  scrollOnMount?: boolean
  children: ReactNode
}) => {
  const ref = useScrollIntoViewOnMount()

  return (
    <div
      ref={scrollOnMount ? ref : undefined}
      className={cx(getRootClassForVariant(variant), 'border-success')}
    >
      <h2 className={cx(classes.title, 'text-success')}>{title}</h2>

      <div className={cx(classes.childrenWrapper)}>{children}</div>

      <p className={cx(classes.footer)}>
        <a
          href={`https://soorria.com/?ref=Utils&utm_medium=SuccessLink&utm_content=${utilSlug}#contact`}
          target="_blank"
          rel="noopener noreferrer"
          className="hover:underline group focus-outline px-2"
        >
          <span className="underline group-hover:no-underline">
            Let me know
          </span>{' '}
          if these results look off
        </a>
      </p>
    </div>
  )
}

export default ResultsSection
