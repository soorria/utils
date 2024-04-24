export const download = (text: string, fileName: string) => {
  const blob = new Blob([text])
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = fileName
  a.rel = 'noopener'
  a.dispatchEvent(new MouseEvent('click'))
}
