import {
  IUnControlledCodeMirror,
  UnControlled as CodeMirror,
  UnControlled,
} from 'react-codemirror2'

import codeMirrorStyles from 'codemirror/lib/codemirror.css'
import draculaThemeStyles from 'codemirror/theme/dracula.css'
import scrollbarStyles from 'codemirror/addon/scroll/simplescrollbars.css'
import overrideStyles from './codemirror.css'
import type { LinkDescriptor } from 'remix'
import { TextareaHTMLAttributes, useEffect, useRef } from 'react'
import Textarea from './Textarea'
import { useHydrated } from 'remix-utils'
import { cx } from '~/lib/utils'

if (typeof window !== 'undefined') {
  require('codemirror/lib/codemirror')
  require('codemirror/addon/scroll/simplescrollbars')
  require('codemirror/addon/display/autorefresh')
}

export const codeMirrorLinks: LinkDescriptor[] = [
  codeMirrorStyles,
  draculaThemeStyles,
  scrollbarStyles,
  overrideStyles,
].map(url => ({
  rel: 'stylesheet',
  href: url,
}))

type CodeMirrorTextareaProps = Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'name'> & {
  name: string
  options: IUnControlledCodeMirror['options']
}

const CodeMirrorTextarea: React.FC<CodeMirrorTextareaProps> = ({
  options,
  className,
  ...delegated
}) => {
  const textarea = useRef<HTMLTextAreaElement>(null)
  const editor = useRef<UnControlled>(null)
  const hydrated = useHydrated()

  useEffect(() => {
    const cm = (editor.current as any).editor
    cm.focus()
  }, [])

  return (
    <>
      <Textarea
        ref={textarea}
        className={cx(hydrated && 'hidden', className)}
        minHeight="16rem"
        {...delegated}
      />
      <div
        className={cx(
          !hydrated && 'hidden',
          'px-4 py-2 rounded-btn border-2 border-primary focus-within-outline'
        )}
        suppressHydrationWarning
        onClick={e => {
          ;(editor.current as any).editor.focus()
        }}
      >
        <CodeMirror
          ref={editor}
          value={delegated.defaultValue as string}
          options={{
            theme: 'dracula',
            scrollbarStyle: 'native' as any,
            viewportMargin: Infinity,
            // @ts-expect-error from an addon
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
