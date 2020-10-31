// Types
import {AnnotationDraft} from 'src/annotations/reducers/annotationFormReducer'

export interface UpdateAnnotationDraftAction {
  type: 'updateAnnotationDraft'
  payload: Partial<AnnotationDraft>
}

export type AnnotationActionType = UpdateAnnotationDraftAction

export const updateAnnotationDraft = (
  payload: Partial<AnnotationDraft>
): UpdateAnnotationDraftAction => ({
  type: 'updateAnnotationDraft',
  payload,
})
