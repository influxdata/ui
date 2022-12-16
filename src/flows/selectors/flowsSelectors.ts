import {Notebook} from 'src/client/notebooksRoutes'
import {AppState} from 'src/types'

export const selectNotebooks = (state: AppState): Notebook[] => {
  return state.resources.notebooks.notebooks
}
