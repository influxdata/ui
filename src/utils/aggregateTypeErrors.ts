const unsupportedAggregateType = 'unsupported aggregate column type'

export const isAggregateTypeError = (
  errorCode: string,
  errorMessage: string
): boolean =>
  errorCode === 'invalid' && errorMessage.includes(unsupportedAggregateType)

export const aggregateTypeError = () => {
  return {
    aggregateType: true,
    message:
      "It looks like you're trying to apply an incompatible aggregate function. You can fix this by selecting the Last Aggregate Function",
  }
}
