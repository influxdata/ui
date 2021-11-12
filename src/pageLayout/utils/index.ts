export const getNavItemActivation = (
  keywords: string[],
  location: string
): boolean => {
  return keywords.some(path => location.includes(path))
}
