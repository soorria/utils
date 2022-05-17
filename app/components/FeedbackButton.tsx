import { memo, useEffect, useRef, useState } from 'react'
import { cx } from '~/lib/utils'

const SCRIPT_SRC = 'https://aqrm.mooth.tech/aqrm.js?s=utils.mooth.tech'

const MODAL_ROOT_ID = 'aqrm-modal-root'

export const FeedbackButtonModalRoot: React.FC = memo(() => <div id={MODAL_ROOT_ID} />)

const FeedbackButton: React.FC = () => {
  const [enabled, setEnabled] = useState(false)
  const buttonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    let widget: { unregister: () => void }

    const root = document.getElementById(MODAL_ROOT_ID)

    const loadedPromise = (() => {
      let resolve: (v?: unknown) => void,
        reject: (v?: unknown) => void,
        done = false
      const promise = new Promise((_resolve, _reject) => {
        resolve = _resolve
        reject = _reject
      })

      const script = document.createElement('script')
      script.onload = () => {
        console.log('load')
        done = true
        resolve()
      }
      script.src = SCRIPT_SRC
      root?.append(script)

      setTimeout(() => {
        if (!done) reject()
      }, 10000)

      return promise
    })()

    loadedPromise
      .then(() => {
        const register = (window as any)._AQRM_REGISTER
        if (register) {
          widget = register(root, buttonRef.current)
          setEnabled(true)
        }
      })
      .catch(() => setEnabled(false))

    return () => {
      widget?.unregister()
    }
  }, [])

  return (
    <button
      ref={buttonRef}
      disabled={!enabled}
      className={cx(
        'inline-block focus-outline px-2 rounded-btn',
        enabled ? 'link link-hover' : 'cursor-not-allowed opacity-75'
      )}
    >
      Feedback &amp; Suggestions
    </button>
  )
}

export default FeedbackButton
