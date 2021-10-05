export const formatQueryText = (queryText: string): string => {
  return (queryText || '')
    .trim()
    .split('|>')
    .join('\n  |>')
}

export const downloadImage = (uri: string, filename: string) => {
  const link = document.createElement('a')

  if (typeof link.download === 'string') {
    link.href = uri
    link.download = filename

    // Firefox requires the link to be in the body
    document.body.appendChild(link)

    link.click()

    document.body.removeChild(link)
  } else {
    window.open(uri)
  }
}
