import { Accessor, createEffect, createSignal, Setter } from 'solid-js'

export const useLocalStorage = <T>(
  key: string,
  initialValue: T
): [get: Accessor<T>, set: Setter<T>, clear: () => void] => {
  const [state, setState] = createSignal<T>(
    (() => {
      const cached = localStorage.getItem(key)

      if (!cached) return initialValue

      try {
        return JSON.parse(cached)
      } catch (err) {
        return initialValue
      }
    })()
  )

  createEffect(() => {
    localStorage.setItem(key, JSON.stringify(state))
  })

  const clearState = () => {
    setState(() => initialValue)
  }

  return [state, setState, clearState]
}
