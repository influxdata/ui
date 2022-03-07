export const handleValidation = (
  property: string,
  formVal: string
): string | null => {
  if (!formVal) {
    return `${property} is required`
  }
  return null
}
