import {AppState} from 'src/types'

import {CLOUD, IOX_SWITCHOVER_CREATION_DATE} from 'src/shared/constants'

import {selectOrgCreationDate} from 'src/organizations/selectors'
import {isFlagEnabled} from 'src/shared/utils/featureFlag'

export const selectShouldShowTasks = (state: AppState): boolean => {
  if (!CLOUD) {
    return true
  }

  const orgCreationDate = new Date(selectOrgCreationDate(state)).valueOf()
  const ioxCutoffDate = new Date(IOX_SWITCHOVER_CREATION_DATE).valueOf()

  const wasCreatedBeforeIOxCutoff = orgCreationDate < ioxCutoffDate

  // In cloud, don't show tasks if org was created after the IOx cutover date and feature flag is enabled
  if (!wasCreatedBeforeIOxCutoff && isFlagEnabled('hideTasks')) {
    return false
  }

  return true
}
