import type { ComponentType, SVGProps } from 'react'

type IconProps = {
  className?: string
} & SVGProps<SVGSVGElement>

export type IconComponent = ComponentType<IconProps>
