import {NoteEditorState} from 'src/dashboards/reducers/notes'

export type Action =
  | CloseNoteEditorAction
  | SetIsPreviewingAction
  | ToggleShowNoteWhenEmptyAction
  | SetNoteAction
  | SetNoteStateAction
  | ResetNoteStateAction

interface CloseNoteEditorAction {
  type: 'CLOSE_NOTE_EDITOR'
}

export const closeNoteEditor = (): CloseNoteEditorAction => ({
  type: 'CLOSE_NOTE_EDITOR',
})

interface SetIsPreviewingAction {
  type: 'SET_IS_PREVIEWING'
  payload: {isPreviewing: boolean}
}

export const setIsPreviewing = (
  isPreviewing: boolean
): SetIsPreviewingAction => ({
  type: 'SET_IS_PREVIEWING',
  payload: {isPreviewing},
})

interface ToggleShowNoteWhenEmptyAction {
  type: 'TOGGLE_SHOW_NOTE_WHEN_EMPTY'
}

export const toggleShowNoteWhenEmpty = (): ToggleShowNoteWhenEmptyAction => ({
  type: 'TOGGLE_SHOW_NOTE_WHEN_EMPTY',
})

interface SetNoteAction {
  type: 'SET_NOTE'
  payload: {note: string}
}

export const setNote = (note: string): SetNoteAction => ({
  type: 'SET_NOTE',
  payload: {note},
})

export interface ResetNoteStateAction {
  type: 'RESET_NOTE_STATE'
}

export const resetNoteState = (): ResetNoteStateAction => ({
  type: 'RESET_NOTE_STATE',
})

export interface SetNoteStateAction {
  type: 'SET_NOTE_STATE'
  payload: Partial<NoteEditorState>
}

export const setNoteState = (
  noteState: Partial<NoteEditorState>
): SetNoteStateAction => ({
  type: 'SET_NOTE_STATE',
  payload: noteState,
})
