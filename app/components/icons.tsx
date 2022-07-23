import type { SVGProps } from 'react'

type IconProps = {
  className?: string
} & SVGProps<SVGSVGElement>

export type IconComponent = React.FC<IconProps>
