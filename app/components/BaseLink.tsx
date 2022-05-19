import { forwardRef } from 'react'
import type { LinkProps } from 'remix'
import { Link } from 'remix'

const BaseLink = forwardRef<HTMLAnchorElement, LinkProps>((props, ref) => {
  return <Link prefetch="intent" {...props} />
})

export default BaseLink
