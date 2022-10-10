import { useCallback, useEffect, useMemo } from 'react'

export const capitalise = (text: string): string =>
  text.charAt(0).toUpperCase() + text.slice(1).toLowerCase()

export const plural = (num: number, singular: string, pluralised: string) =>
  num === 1 ? singular : pluralised

export const randomItem = <T>(arr: T[]): T =>
  arr[Math.floor(Math.random() * arr.length)]!

export type WeightedRandomArray<T> = ([T, number] | [T])[]
export const weightedRandomItem = <T>(arr: WeightedRandomArray<T>): T => {
  const smallestWeight = Math.min(
    ...arr.map(([_, w]) => (typeof w === 'undefined' ? 1 : w))
  )
  const multiplier = Math.ceil(1 / smallestWeight)
  const choices = arr.flatMap(([val, n = 1]) =>
    Array.from({ length: n * multiplier }, _ => val)
  )

  return randomItem(choices)
}

export const cx = (...classes: (string | boolean | null | undefined)[]) =>
  classes.filter(cls => typeof cls === 'string' && Boolean(cls)).join(' ')

type FormDataEntryValue = string | File
export const areFormValuesOnlyFiles = (arr: FormDataEntryValue[]): boolean =>
  arr.every(entry => entry instanceof File)

export const filterOnlyFiles = (arr: unknown[]): File[] =>
  arr.filter(el => el instanceof File) as File[]

export const getResolvedPromiseValueOrDefault = <T>(
  promiseResult: PromiseSettledResult<T>,
  defaultValue: T
): T => {
  if (
    process.env.NODE_ENV !== 'production' &&
    promiseResult.status === 'rejected'
  ) {
    console.error(promiseResult.reason)
  }

  return promiseResult.status === 'fulfilled'
    ? promiseResult.value
    : defaultValue
}

export const range = (min: number, max: number): number[] =>
  Array.from({ length: max - min }, (_, i) => i + min)

export const sleep = (ms: number) =>
  new Promise(resolve => setTimeout(resolve, ms))

type UseCssVarProps = {
  /**
   * Name of the CSS custom property, including the leading `--`.
   *
   * e.g. '--progress'
   */
  name: string

  /**
   * The element to add the custom property to.
   *
   * Defaults to `document.body`
   */
  root?: HTMLElement
}

type CssVarControls = {
  set: (value: string) => void
  get: () => string
  remove: () => void
}

export const useCssVar = ({
  name,
  root = document.body,
}: UseCssVarProps): CssVarControls => {
  const controls: CssVarControls = useMemo(
    () => ({
      set: value => root.style.setProperty(name, value),
      get: () => root.style.getPropertyValue(name),
      remove: () => root.style.removeProperty(name),
    }),
    [name, root]
  )

  useEffect(() => {
    return () => controls.remove()
  }, [controls.remove])

  return controls
}

export const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max)

export const getCookieHeader = (request: Request) =>
  request.headers.get('Cookie')

type ErrorMap<TErrors extends Record<string, string[]>> = Record<
  keyof TErrors,
  string | null
>
export const getErrorMap = <TErrors extends Record<string, string[]>>(
  errors: TErrors
): ErrorMap<TErrors> => {
  return Object.fromEntries(
    Object.entries(errors || ({} as TErrors)).map(([field, errors]) => [
      field,
      errors?.[0] || null,
    ])
  ) as ErrorMap<TErrors>
}

const UNITS = {
  1000: ['B', 'kB', 'MB', 'GB', 'TB'],
  1024: ['B', 'kiB', 'MiB', 'GiB', 'TiB'],
}

// Adapted from https://stackoverflow.com/a/20732091
export const humanFileSize = (size: number, base: 1024 | 1000 = 1000) => {
  const i = size == 0 ? 0 : Math.floor(Math.log(size) / Math.log(base))
  return `${(size / Math.pow(base, i)).toFixed(2)} ${UNITS[base][i]}`
}

export const useScrollIntoViewOnMount = <T extends Element>() => {
  return useCallback((el: T | null) => {
    el?.scrollIntoView(true)
  }, [])
}

export type PartiallyOptional<T, K extends keyof T> = Omit<T, K> &
  Partial<Pick<T, K>>
