import {Notebook} from 'src/client/notebooksRoutes'
import {AppState} from 'src/types'

import {IOX_SWITCHOVER_CREATION_DATE} from 'src/shared/constants'

import {selectOrgCreationDate} from 'src/organizations/selectors'

export const selectNotebooks = (state: AppState): Notebook[] => {
  return state.resources.notebooks.notebooks
}

export const selectShouldShowNotebooks = (state: AppState): boolean => {
  const orgCreationDate = new Date(selectOrgCreationDate(state)).valueOf()
  const ioxCutoffDate = new Date(IOX_SWITCHOVER_CREATION_DATE).valueOf()

  const wasCreatedBeforeIOxCutoff = orgCreationDate < ioxCutoffDate

  // Don't show notebooks for any org created after the IOx cutover date
  if (!wasCreatedBeforeIOxCutoff) {
    return false
  }

  // If the org was created before the IOx cutover date, only show notebooks if the account has notebooks
  return selectNotebooks(state).length > 0
}
