import * as MonacoTypes from 'monaco-editor/esm/vs/editor/editor.api'
import isEqual from 'lodash/isEqual'

import {
  DEFAULT_SELECTION,
  CompositionSelection,
} from 'src/dataExplorer/context/persistance'

// Types
import {EditorType, RecursivePartial} from 'src/types'
import {LspRange as FluxLspRange} from 'src/languageSupport/languages/flux/lsp/types'

// Utils
import {notify} from 'src/shared/actions/notifications'
import {oldSession} from 'src/shared/copy/notifications'

// May as well re-use this well formed type.
export type LspRange = FluxLspRange

export class ConnectionManager {
  protected _editor: EditorType
  protected _model: MonacoTypes.editor.IModel
  protected _compositionStyle: string[] = []
  protected _session: CompositionSelection = JSON.parse(
    JSON.stringify(DEFAULT_SELECTION)
  )
  protected _callbackSetSession: (
    schema: RecursivePartial<CompositionSelection>
  ) => void = () => null
  protected _dispatcher = _ => {}
  protected _first_load = true
  protected _compositionRange: LspRange = null

  subscribeToModel(editor: EditorType) {
    this._editor = editor
    this._model = editor.getModel()
  }

  _setSessionSync(synced: boolean) {
    this._callbackSetSession({
      composition: {synced},
    })
  }

  _compositionSyncStyle(startLine: number, endLine: number, synced: boolean) {
    const classNamePrefix = synced
      ? 'composition-sync--on'
      : 'composition-sync--off'

    // Customize the full width of Monaco editor margin using API `marginClassName`
    // https://github.com/microsoft/monaco-editor/blob/35eb0ef/website/typedoc/monaco.d.ts#L1533
    const startLineStyle = {
      range: new MonacoTypes.Range(startLine, 1, startLine, 1),
      options: {
        marginClassName: `${classNamePrefix}--first`,
      },
    }
    const middleLinesStyle = {
      range: new MonacoTypes.Range(startLine, 1, endLine, 1),
      options: {
        marginClassName: classNamePrefix,
      },
    }
    const endLineStyle = {
      range: new MonacoTypes.Range(endLine, 1, endLine, 1),
      options: {
        marginClassName: `${classNamePrefix}--last`,
      },
    }
    return [startLineStyle, middleLinesStyle, endLineStyle]
  }

  _setEditorBlockStyle(range: LspRange | null, synced: boolean = false) {
    this._compositionRange = range
    const shouldRemoveAllStyles = range == null

    this._compositionStyle = this._editor.deltaDecorations(
      this._compositionStyle,
      shouldRemoveAllStyles
        ? []
        : this._compositionSyncStyle(range.start.line, range.end.line, synced)
    )
  }

  _isNewScript(
    schema: CompositionSelection,
    previousState: CompositionSelection
  ): boolean {
    return previousState.bucket != null && schema.bucket == null
  }

  _diffSchemaChange(
    schema: CompositionSelection,
    previousState: CompositionSelection,
    defaultText: string
  ) {
    const toAdd: Partial<CompositionSelection> = {}
    const toRemove: Partial<CompositionSelection> = {}
    let shouldRemoveDefaultMsg = false

    if (this._isNewScript(schema, previousState)) {
      // no action to take.
      // `textDocument/didChange` --> will inform LSP to drop composition
      return {toAdd, toRemove, shouldRemoveDefaultMsg}
    }

    if (schema.bucket && previousState.bucket != schema.bucket) {
      toAdd.bucket = schema.bucket
      if (this._model.getValue() == defaultText) {
        shouldRemoveDefaultMsg = true
      }
    }
    if (schema.measurement && previousState.measurement != schema.measurement) {
      toAdd.measurement = schema.measurement
    }
    if (!isEqual(schema.fields, previousState.fields)) {
      const fieldsToRemove = previousState.fields.filter(
        f => !schema.fields.includes(f)
      )
      if (fieldsToRemove.length) {
        toRemove.fields = fieldsToRemove
      }
      const fieldsToAdd = schema.fields.filter(
        f => !previousState.fields.includes(f)
      )
      if (fieldsToAdd.length) {
        toAdd.fields = fieldsToAdd
      }
    }
    if (!isEqual(schema.tagValues, previousState.tagValues)) {
      const tagValuesToRemove = previousState.tagValues.filter(
        ({key, value}) =>
          !schema.tagValues.some(pair => pair.value == value && pair.key == key)
      )
      if (tagValuesToRemove.length) {
        toRemove.tagValues = tagValuesToRemove
      }
      const tagValuesToAdd = schema.tagValues.filter(
        ({key, value}) =>
          !previousState.tagValues.some(
            pair => pair.value == value && pair.key == key
          )
      )
      if (tagValuesToAdd.length) {
        toAdd.tagValues = tagValuesToAdd
      }
    }

    return {toAdd, toRemove, shouldRemoveDefaultMsg}
  }

  _updateLocalState(schema: CompositionSelection, sessionCb, dispatch) {
    if (!schema.composition) {
      dispatch(notify(oldSession()))
      return {shouldContinue: false}
    }

    this._dispatcher = dispatch
    this._callbackSetSession = sessionCb
    const previousState = {
      ...this._session,
      composition: {...this._session?.composition},
    }

    if (!schema.composition.synced) {
      this._session.composition.synced = false
      this._setEditorBlockStyle(this._compositionRange)
      return {shouldContinue: false}
    }
    const syncTurnedBackOn =
      schema.composition.synced && !previousState.composition.synced
    if (syncTurnedBackOn) {
      this._setEditorBlockStyle(this._compositionRange, true)
    }

    this._session = {...schema, composition: {...schema.composition}}
    return {previousState, shouldContinue: true}
  }

  dispose() {
    this._model.onDidChangeContent(null)
  }
}
