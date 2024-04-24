import { forwardRef, HTMLAttributes } from 'react'

interface BleedProps extends HTMLAttributes<HTMLDivElement> {}

const Bleed = forwardRef<HTMLDivElement, BleedProps>(
  ({ style, ...props }, ref) => {
    return (
      <div
        {...props}
        style={{
          // @ts-expect-error
          '--width':
            'min(1280px - var(--bleed-buffer), 100vw - var(--bleed-buffer))',
          '--half-width': 'calc(var(--width) / 2 * -1)',
          width: 'var(--width)',
          position: 'relative',
          left: '50%',
          right: '50%',
          marginLeft: 'var(--half-width)',
          marginRight: 'var(--half-width)',
          ...style,
        }}
        ref={ref}
      />
    )
  }
)

export default Bleed
