import Prism from 'prismjs'
import 'prismjs/components/prism-json.js'
import 'prismjs/components/prism-jsx.js'
import 'prismjs/components/prism-typescript.js'
import 'prismjs/components/prism-tsx.js'

export const highlight = (code: string, language: string) => {
  return Prism.highlight(code, Prism.languages[language]!, 'json')
}
