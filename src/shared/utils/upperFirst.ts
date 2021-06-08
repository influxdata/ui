export const upperFirst = (characters: string): string => {
  let result = ''
  if (typeof characters !== 'string' || characters.length < 1) {
    return result
  }
  result += characters.charAt(0).toUpperCase()
  for (let index = 1; index < characters.length; index += 1) {
    result += characters.charAt(index)
  }
  return result
}
