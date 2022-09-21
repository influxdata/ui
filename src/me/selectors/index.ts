// Types
import {AppState, Me} from 'src/types'

// Utils
import {convertStringToEpoch} from 'src/shared/utils/dateTimeUtils'

// Constants
import {CREDIT_250_EXPERIENCE_CUTOFF_EPOCH} from 'src/shared/constants'

export const getMe = (state: AppState): AppState['me'] => {
  return state.me
}

export const shouldGetCredit250Experience = (state: AppState): boolean => {
  const account = state.identity.currentIdentity.account
  const {type: accountType, accountCreatedAt} = account

  const accountCreatedAtEpoch = convertStringToEpoch(accountCreatedAt)

  if (
    accountType === 'free' &&
    accountCreatedAtEpoch < CREDIT_250_EXPERIENCE_CUTOFF_EPOCH
  ) {
    return true
  }
  return false
}

export const shouldShowUpgradeButton = (state: AppState): boolean => {
  const account = state.identity.currentIdentity.account
  const {type: accountType, isUpgradeable} = account
  return accountType === 'free' && isUpgradeable === true
}
