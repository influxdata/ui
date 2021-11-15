// Constants
import {HOMEPAGE_PATHNAME} from 'src/shared/constants'

export const getNavItemActivation = (
  keywords: string[],
  location: string
): boolean => {
  if (location.split('/').length <= 3) {
    location = HOMEPAGE_PATHNAME
  }
  return keywords.some(path => location.includes(path))
}
