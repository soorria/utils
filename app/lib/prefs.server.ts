// @ts-expect-error doesn't have types
import themes from 'daisyui/src/colors/themes'
import type { Session } from 'remix'
import { randomItem } from './utils'

export type Prefs = {
  js: boolean
  theme: string
  realTheme?: string
}

export const defaultPrefs: Prefs = {
  js: true,
  theme: 'dracula',
}

export const themeNames = Object.keys(themes)
  .map(selector => selector.replace(/^\[data-theme="?/, '').replace(/]"?$/, ''))
  .filter(Boolean)
  .sort()

const sessionKeys = {
  js: 'js',
  theme: 'theme',
} as const

export const getPrefsFromSession = (session: Session): Prefs => {
  const prefs = { js: true, theme: 'dracula' } as Prefs

  if (session.get(sessionKeys.js) === 'false') {
    prefs.js = false
  }

  const themeFromSession = session.get(sessionKeys.theme)
  if (themeFromSession === '$$random') {
    prefs.theme = randomItem(themeNames)
    prefs.realTheme = '$$random'
  } else if (themeNames.includes(themeFromSession)) {
    prefs.theme = themeFromSession
  }

  return prefs
}

export const setPrefsToSession = (prefs: Partial<Prefs>, session: Session) => {
  if (typeof prefs.js === 'boolean') {
    session.set(sessionKeys.js, prefs.js.toString())
  }

  if (typeof prefs.theme === 'string') {
    session.set(sessionKeys.theme, prefs.theme)
  }
}
