import Prism from 'prismjs'
import loadLanguages from 'prismjs/components/index'

export const highlight = (code: string, language: string) => {
  loadLanguages([language])
  return Prism.highlight(code, Prism.languages[language], language)
}
