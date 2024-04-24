import { LinkProps, Link } from '@remix-run/react'
import { forwardRef } from 'react'

const BaseLink = forwardRef<HTMLAnchorElement, LinkProps>((props, ref) => {
  return <Link prefetch="intent" {...props} ref={ref} />
})

export default BaseLink
