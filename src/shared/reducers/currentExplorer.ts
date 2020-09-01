import {Action, SET_IS_AUTO_FUNCTION} from 'src/shared/actions/currentExplorer'

export interface CurrentExplorerState {
  isAutoFunction: boolean
}

export const initialState: CurrentExplorerState = {
  isAutoFunction: true,
}

const reducer = (
  state: CurrentExplorerState = initialState,
  action: Action
): CurrentExplorerState => {
  switch (action.type) {
    case SET_IS_AUTO_FUNCTION:
      state.isAutoFunction = action.isAutoFunction
      return {...state}
    default:
      return state
  }
}

export default reducer
