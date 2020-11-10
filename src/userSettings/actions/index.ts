export type ActionTypes =
  | ToggleShowVariablesControlsAction
  | ToggleShowAnnotationsControlsAction

interface ToggleShowVariablesControlsAction {
  type: 'TOGGLE_SHOW_VARIABLES_CONTROLS'
}

export const toggleShowVariablesControls = (): ToggleShowVariablesControlsAction => ({
  type: 'TOGGLE_SHOW_VARIABLES_CONTROLS',
})

interface ToggleShowAnnotationsControlsAction {
  type: 'TOGGLE_SHOW_ANNOTATIONS_CONTROLS'
}

export const toggleShowAnnotationsControls = (): ToggleShowAnnotationsControlsAction => ({
  type: 'TOGGLE_SHOW_ANNOTATIONS_CONTROLS',
})
