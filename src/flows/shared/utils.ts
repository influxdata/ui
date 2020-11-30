export const formatQueryText = (queryText: string): string => {
  return (queryText || '')
    .trim()
    .split('|>')
    .join('\n  |>')
}

export const makeErrorHumanFriendly = (
  error: string,
  aggFunc: string
): string => {
  const isAggTypeError = error.startsWith('unsupported aggregate')

  const isStringType = error.includes('type string')

  if (isAggTypeError) {
    return `${aggFunc} cannot be applied to ${
      isStringType ? 'strings' : 'integers'
    }, try selecting ${isStringType ? 'first or last' : 'mean'}`
  }

  return error
}
