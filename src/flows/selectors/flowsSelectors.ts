import {Notebook} from 'src/client/notebooksRoutes'
import {AppState} from 'src/types'

import {CLOUD, IOX_SWITCHOVER_CREATION_DATE} from 'src/shared/constants'

import {selectOrgCreationDate} from 'src/organizations/selectors'
import {isFlagEnabled} from 'src/shared/utils/featureFlag'

export const selectNotebooks = (state: AppState): Notebook[] => {
  return state.resources.notebooks.notebooks
}

export const selectShouldShowNotebooks = (state: AppState): boolean => {
  // Use this flag in CI to force the display of notebooks, even if no notebooks yet exist.
  if (isFlagEnabled('showNotebooksForCI')) {
    return true
  }

  const orgCreationDate = new Date(selectOrgCreationDate(state)).valueOf()
  const ioxCutoffDate = new Date(IOX_SWITCHOVER_CREATION_DATE).valueOf()

  const wasCreatedBeforeIOxCutoff = orgCreationDate < ioxCutoffDate

  if (!CLOUD) {
    return true
  }

  // In cloud, don't show notebooks for any org created after the IOx cutover date
  if (!wasCreatedBeforeIOxCutoff) {
    return false
  }

  // In cloud, if the org was created before the IOx cutover date, only show notebooks if the account has notebooks
  return selectNotebooks(state).length > 0
}
