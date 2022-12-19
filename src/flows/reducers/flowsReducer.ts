import {Notebook} from 'src/client/notebooksRoutes'
import {Actions, SET_NOTEBOOKS} from 'src/flows/actions/flowsActions'

export interface NotebooksState {
  notebooks: Notebook[]
}

const INITIAL_STATE = {
  notebooks: [],
}

export const flowsReducer = (
  state = INITIAL_STATE,
  action: Actions
): NotebooksState => {
  switch (action.type) {
    case SET_NOTEBOOKS: {
      return {...state, notebooks: action.notebooks}
    }
    default: {
      return state
    }
  }
}
