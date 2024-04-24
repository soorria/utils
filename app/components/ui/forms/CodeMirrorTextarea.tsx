import {
  IUnControlledCodeMirror,
  UnControlled as CodeMirror,
  UnControlled,
} from 'react-codemirror2'

import 'codemirror/lib/codemirror.css'
import 'codemirror/theme/dracula.css'
import 'codemirror/addon/scroll/simplescrollbars.css'
import './codemirror.css'
import { TextareaHTMLAttributes, useEffect, useRef } from 'react'
import Textarea from './Textarea'
import { useHydrated } from 'remix-utils/use-hydrated'
import { cx } from '~/lib/utils'

if (typeof window !== 'undefined') {
  require('codemirror/lib/codemirror')
  require('codemirror/addon/scroll/simplescrollbars')
  require('codemirror/addon/display/autorefresh')
}

type CodeMirrorTextareaProps = Omit<
  TextareaHTMLAttributes<HTMLTextAreaElement>,
  'name'
> & {
  name: string
  options: IUnControlledCodeMirror['options']
}

const CodeMirrorTextarea = ({
  options,
  className,
  ...delegated
}: CodeMirrorTextareaProps) => {
  const textarea = useRef<HTMLTextAreaElement>(null)
  const editor = useRef<UnControlled>(null)
  const hydrated = useHydrated()

  useEffect(() => {
    const cm = editor.current?.editor
    cm?.focus()
  }, [])

  return (
    <>
      <Textarea
        ref={textarea}
        className={cx(hydrated && 'hidden', className)}
        minHeight="16rem"
        {...delegated}
      />
      {/* eslint-disable-next-line jsx-a11y/no-static-element-interactions */}
      <div
        onKeyDown={() => {}}
        className={cx(
          !hydrated && 'hidden',
          'px-4 py-2 rounded-btn border-2 border-primary focus-within-outline'
        )}
        suppressHydrationWarning
        onClick={() => {
          editor.current?.editor.focus()
        }}
      >
        <CodeMirror
          ref={editor}
          value={delegated.defaultValue as string}
          options={{
            theme: 'dracula',
            scrollbarStyle: 'native',
            viewportMargin: Infinity,
            autoRefresh: true,
            ...options,
          }}
          onChange={(_editor, _data, value) => {
            if (textarea.current) textarea.current.value = value
          }}
        />
      </div>
    </>
  )
}

export default CodeMirrorTextarea
