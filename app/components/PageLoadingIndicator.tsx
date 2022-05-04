import { useEffect } from 'react'
import { useTransition } from 'remix'
import { clamp, useCssVar } from '~/lib/utils'

const PROGRESS_VAR = '--progress'
const PROGRESS_DURATION_VAR = '--duration'
const PROGRESS_DURATION = 200
const PROGRESS_DURATION_MS = `${PROGRESS_DURATION}ms`
const SHOW_VAR = '--loading'

const PageLoadingIndicator: React.FC = () => {
  const transition = useTransition()

  const progress = useCssVar({ name: PROGRESS_VAR })
  const progressDuration = useCssVar({ name: PROGRESS_DURATION_VAR })
  const show = useCssVar({ name: SHOW_VAR })

  useEffect(() => {
    if (transition.state === 'submitting') return

    if (transition.state === 'idle') {
      progress.set('1')
      let timeout = setTimeout(() => {
        show.set('0')
      }, PROGRESS_DURATION)
      return () => {
        clearTimeout(timeout)
      }
    }

    const setWithoutTransition = (val: string): Promise<void> => {
      return new Promise(resolve => {
        requestAnimationFrame(() => {
          progressDuration.set('0')
          progress.set(val)
          requestAnimationFrame(() => {
            progressDuration.remove()
            resolve()
          })
        })
      })
    }

    let timeout: NodeJS.Timeout

    show.set('1')
    void (async () => {
      await setWithoutTransition('0')

      let current = 0.05
      progress.set('0.05')

      const loop = () => {
        progress.set(current.toString())

        timeout = setTimeout(loop, PROGRESS_DURATION)
        current = clamp(current + (0.95 - current) / 20, 0, 0.95)
      }

      loop()
    })()

    return () => {
      clearTimeout(timeout)
    }
  }, [transition, show, progress])

  return (
    <div
      className="fixed inset-x-0 h-0.5 z-50 pointer-events-none transition-opacity ease-linear"
      style={{
        opacity: `var(${SHOW_VAR})`,
      }}
    >
      <div
        className="h-full bg-primary shadow-sm shadow-primary transition-transform"
        style={{
          transform: `translateX(calc((1 - var(${PROGRESS_VAR})) * 100% * -1))`,
          transitionDuration: `var(${PROGRESS_DURATION_VAR}, ${PROGRESS_DURATION_MS})`,
        }}
      />
      <button
        className="pointer-events-auto btn"
        onClick={() => {
          progressDuration.set('0ms')
          progress.set('0.3')
          requestAnimationFrame(() => {
            progressDuration.remove()
          })
        }}
      >
        hello
      </button>
    </div>
  )
}

export default PageLoadingIndicator
