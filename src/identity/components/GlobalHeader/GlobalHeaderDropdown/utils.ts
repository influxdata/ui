import {isFlagEnabled} from 'src/shared/utils/featureFlag'

export const pageHeaderStyleWithGlobalHeader = {
  height: '50px',
  flex: '0 0 50px',
}

export const optionallyApplyGlobalHeaderStyle = () => {
  if (isFlagEnabled('multiOrg')) {
    return pageHeaderStyleWithGlobalHeader
  }
  return {}
}
