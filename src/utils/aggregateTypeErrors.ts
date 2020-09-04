const unsupportedAggregateType = 'unsupported aggregate column type'

export const isAggregateTypeError = (
  errorCode: string,
  errorMessage: string
): boolean =>
  errorCode === 'invalid' && errorMessage.includes(unsupportedAggregateType)

export const aggregateTypeError = () => {
  return {
    aggregateType: true,
    message: `It looks like you're trying to apply a number-based aggregate function to a string, which cannot be processed. You can fix this by selecting the Aggregate Function "Last"`,
  }
}
