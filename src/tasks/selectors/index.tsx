// Libraries
import {get} from 'lodash'

// Types
import {AppState} from 'src/types'

export const getAllScripts = (state: AppState) => {
  return get(state, 'resources.tasks.scripts', null)
}
