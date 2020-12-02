import {ActionTypes} from 'src/annotations/actions'

export interface AnnotationsState {
  visibleStreamsByID: string[]
}

export const initialState = (): AnnotationsState => ({
  visibleStreamsByID: [],
})

// TODO: use immer
export const annotationsReducer = (
  state = initialState(),
  action: ActionTypes
): AnnotationsState => {
  switch (action.type) {
    case 'ENABLE_ANNOTATION_STREAM':
      return {
        ...state,
        visibleStreamsByID: [...state.visibleStreamsByID, action.streamID],
      }
    case 'DISABLE_ANNOTATION_STREAM':
      return {
        ...state,
        visibleStreamsByID: state.visibleStreamsByID.filter(
          streamID => streamID !== action.streamID
        ),
      }
    default:
      return state
  }
}
