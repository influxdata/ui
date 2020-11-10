import {ActionTypes} from 'src/userSettings/actions'

export interface UserSettingsState {
  showVariablesControls: boolean
  showAnnotationsControls: boolean
}

export const initialState = (): UserSettingsState => ({
  showVariablesControls: true,
  showAnnotationsControls: false,
})

export const userSettingsReducer = (
  state = initialState(),
  action: ActionTypes
): UserSettingsState => {
  switch (action.type) {
    case 'TOGGLE_SHOW_VARIABLES_CONTROLS':
      return {...state, showVariablesControls: !state.showVariablesControls}
    case 'TOGGLE_SHOW_ANNOTATIONS_CONTROLS':
      return {...state, showAnnotationsControls: !state.showAnnotationsControls}
    default:
      return state
  }
}
