import {AppState} from 'src/types'

import {CLOUD, IOX_SWITCHOVER_CREATION_DATE} from 'src/shared/constants'

import {selectOrgCreationDate} from 'src/organizations/selectors'
import {isFlagEnabled} from 'src/shared/utils/featureFlag'

export const selectShouldShowAlerts = (state: AppState): boolean => {
  if (!CLOUD) {
    return true
  }

  const orgCreationDate = new Date(selectOrgCreationDate(state)).valueOf()
  const ioxCutoffDate = new Date(IOX_SWITCHOVER_CREATION_DATE).valueOf()

  const wasCreatedBeforeIOxCutoff = orgCreationDate < ioxCutoffDate

  // In cloud, don't show alerts if org was created after the IOx cutoff date and feature flag is enabled
  if (!wasCreatedBeforeIOxCutoff && isFlagEnabled('hideAlerts')) {
    return false
  }

  return true
}