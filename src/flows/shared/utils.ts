export interface FormatQueryTextReturn {
  text: string
  lineCount: number
}

export const formatQueryText = (queryText: string): FormatQueryTextReturn => {
  const newLineChar = '\n'
  const formattedQueryText = (queryText || '')
    .trim()
    .split('|>')
    .join('\n  |>')

  const lineCount = formattedQueryText.split(newLineChar).length

  return {
    text: formattedQueryText,
    lineCount,
  }
}
