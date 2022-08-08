// Types
import {AppState, Me} from 'src/types'
import {RemoteDataState} from '@influxdata/clockface'

// Utils
import {convertStringToEpoch} from 'src/shared/utils/dateTimeUtils'

// Constants
import {CREDIT_250_EXPERIENCE_CUTOFF_EPOCH} from 'src/shared/constants'

export const getMe = (state: AppState): AppState['me'] => {
  return state.me
}

export const getQuartzMe = (state: AppState): Me => state?.me?.quartzMe
export const getQuartzMeStatus = (state: AppState): RemoteDataState =>
  state?.me?.quartzMeStatus

export const shouldGetCredit250Experience = (state: AppState): boolean => {
  const accountType = state.me.quartzMe?.accountType ?? ''
  const accountCreatedAt = state.me.quartzMe?.accountCreatedAt ?? ''

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
  const {quartzMe} = state.me
  const isRegionBeta = quartzMe?.isRegionBeta ?? false
  const accountType = quartzMe?.accountType ?? 'free'
  return accountType === 'free' && isRegionBeta === false
}
