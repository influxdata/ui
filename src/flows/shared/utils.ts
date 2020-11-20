export const formatQueryText = (queryText: string): string => {
  return (queryText || '')
    .trim()
    .split('|>')
    .join('\n  |>')
}
