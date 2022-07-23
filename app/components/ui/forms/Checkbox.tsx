import { InputHTMLAttributes, useEffect, useRef } from 'react'
import { cx } from '~/lib/utils'

type CheckboxProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> & {
  indeterminate?: boolean
}

const Checkbox: React.FC<CheckboxProps> = ({ indeterminate = false, className, ...delegated }) => {
  const input = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (input.current) input.current.indeterminate = indeterminate
  }, [indeterminate])

  return <input ref={input} type="checkbox" className={cx(className)} {...delegated} />
}

export default Checkbox
