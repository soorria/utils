export const isUrl = (maybeUrl: string): boolean => {
  try {
    new URL(maybeUrl)
    return true
  } catch {
    return false
  }
}

export const getMaybeLinksFromTextParam = (text: string | null): string[] | null =>
  text ? text.split(/\s/).filter(u => isUrl(u)) : null
