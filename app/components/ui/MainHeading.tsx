import { forwardRef, ReactNode } from 'react'

const MainHeading = forwardRef<HTMLHeadingElement, { children?: ReactNode }>(
  ({ children }, ref) => {
    return (
      <h1 ref={ref} className="text-5xl mt-8 scroll-mt-8">
        {children}
      </h1>
    )
  }
)

export default MainHeading
