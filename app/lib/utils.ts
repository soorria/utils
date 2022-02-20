export const capitalise = (text: string): string =>
  text.charAt(0).toUpperCase() + text.slice(1).toLowerCase()

export const randomItem = <T>(arr: T[]): T =>
  arr[Math.floor(Math.random() * arr.length)]

export const cx = (...classes: (string | boolean | null | undefined)[]) =>
  classes.filter(cls => typeof cls === 'string').join(' ')

type FormDataEntryValue = string | File
export const areFormValuesOnlyFiles = (arr: FormDataEntryValue[]): boolean =>
  arr.every(entry => entry instanceof File)

export const filterOnlyFiles = (arr: unknown[]): File[] =>
  arr.filter(el => el instanceof File) as File[]
