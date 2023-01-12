// Types
import {AppState} from 'src/types'

export const getMe = (state: AppState): AppState['me'] => {
  return state.me
}

export const shouldGetCredit250Experience = (state: AppState): boolean => {
  const accountType = state.identity.currentIdentity.account.type

  if (accountType === 'free') {
    return true
  }
  return false
}

export const shouldShowUpgradeButton = (state: AppState): boolean =>
  state.identity.currentIdentity.account.isUpgradeable
