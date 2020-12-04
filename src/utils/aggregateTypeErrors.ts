const unsupportedAggregateType = 'unsupported aggregate column type'

export const isAggregateTypeError = (
  errorCode: string,
  errorMessage: string
): boolean =>
  errorCode === 'invalid' && errorMessage.includes(unsupportedAggregateType)
