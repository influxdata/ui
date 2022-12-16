import * as allMonaco from 'monaco-editor/esm/vs/editor/editor.api'

export type MonacoType = typeof allMonaco
export type MonacoEnvironmentType = allMonaco.Environment
export type EditorType = allMonaco.editor.IStandaloneCodeEditor
export type CursorEvent = allMonaco.editor.ICursorPositionChangedEvent
export type KeyboardEvent = allMonaco.IKeyboardEvent
export type MonacoRange = allMonaco.Range
export type MonacoSelectionRange = allMonaco.Selection
export interface MonacoBasicLanguage {
  conf: allMonaco.languages.LanguageConfiguration
  language: allMonaco.languages.IMonarchLanguage
}
