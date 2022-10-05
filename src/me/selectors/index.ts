// Types
import {AppState} from 'src/types'

// Utils
import {convertStringToEpoch} from 'src/shared/utils/dateTimeUtils'

// Constants
import {CREDIT_250_EXPERIENCE_CUTOFF_EPOCH} from 'src/shared/constants'

export const getMe = (state: AppState): AppState['me'] => {
  return state.me
}

export const shouldGetCredit250Experience = (state: AppState): boolean => {
  const accountType = state.identity.currentIdentity.account.type
  const accountCreatedAt =
    state.identity.currentIdentity.account.accountCreatedAt

  const accountCreatedAtEpoch = convertStringToEpoch(accountCreatedAt)

  if (
    accountType === 'free' &&
    accountCreatedAtEpoch < CREDIT_250_EXPERIENCE_CUTOFF_EPOCH
  ) {
    return true
  }
  return false
}

export const shouldShowUpgradeButton = (state: AppState): boolean =>
  state.identity.currentIdentity.account.isUpgradeable === true
