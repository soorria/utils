export const capitalise = (text: string): string =>
  text.charAt(0).toUpperCase() + text.slice(1).toLowerCase()

export const randomItem = <T>(arr: T[]): T =>
  arr[Math.floor(Math.random() * arr.length)]
