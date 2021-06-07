// Types
import {AppState, Me} from 'src/types'

export const getMe = (state: AppState): AppState['me'] => {
  return state.me
}

export const getQuartzMe = (state: AppState): Me => state.me.quartzMe

export const shouldShowUpgradeButton = (state: AppState): boolean => {
  const {quartzMe} = state.me
  const isRegionBeta = quartzMe?.isRegionBeta ?? false
  const accountType = quartzMe?.accountType ?? 'free'
  return accountType === 'free' && isRegionBeta === false
}
