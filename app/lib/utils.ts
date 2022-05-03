export const capitalise = (text: string): string =>
  text.charAt(0).toUpperCase() + text.slice(1).toLowerCase()

export const randomItem = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)]

export type WeightedRandomArray<T> = ([T, number] | [T])[]
export const weightedRandomItem = <T>(arr: WeightedRandomArray<T>): T => {
  const smallestWeight = Math.min(...arr.map(([_, w]) => (typeof w === 'undefined' ? 1 : w)))
  const multiplier = Math.ceil(1 / smallestWeight)
  const choices = arr.flatMap(([val, n = 1]) => Array.from({ length: n * multiplier }, _ => val))

  return randomItem(choices)
}

export const cx = (...classes: (string | boolean | null | undefined)[]) =>
  classes.filter(cls => typeof cls === 'string').join(' ')

type FormDataEntryValue = string | File
export const areFormValuesOnlyFiles = (arr: FormDataEntryValue[]): boolean =>
  arr.every(entry => entry instanceof File)

export const filterOnlyFiles = (arr: unknown[]): File[] =>
  arr.filter(el => el instanceof File) as File[]

export const getResolvedPromiseValueOrDefault = <T>(
  promiseResult: PromiseSettledResult<T>,
  defaultValue: T
): T => {
  if (process.env.NODE_ENV !== 'production' && promiseResult.status === 'rejected') {
    console.error(promiseResult.reason)
  }

  return promiseResult.status === 'fulfilled' ? promiseResult.value : defaultValue
}

export const range = (min: number, max: number): number[] =>
  Array.from({ length: max - min }, (_, i) => i + min)

export const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))
