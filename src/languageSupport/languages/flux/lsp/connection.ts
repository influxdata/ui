import {MonacoLanguageClient} from 'monaco-languageclient'
import * as MonacoTypes from 'monaco-editor/esm/vs/editor/editor.api'
import {format_from_js_file} from 'src/languageSupport/languages/flux/lspUtils'

import {ConnectionManager as AgnosticConnectionManager} from 'src/languageSupport/languages/agnostic/connection'

// handling variables
import {EditorType, Variable} from 'src/types'
import {buildUsedVarsOption} from 'src/variables/utils/buildVarsOption'

// handling schema composition
import {RecursivePartial, TagKeyValuePair} from 'src/types'
import {
  DEFAULT_FLUX_EDITOR_TEXT,
  CompositionSelection,
} from 'src/dataExplorer/context/persistance'

// LSP methods
import {
  didOpen,
  didChange,
  executeCommand,
} from 'src/languageSupport/languages/flux/lsp/utils'
import {
  ExecuteCommand,
  ExecuteCommandArgument,
  ExecuteCommandT,
  LspClientRequest,
  LspClientCommand,
  ActionItem,
  ActionItemCommand,
} from 'src/languageSupport/languages/flux/lsp/types'

// Utils
import {reportErrorThroughHoneyBadger} from 'src/shared/utils/errors'
import {notify} from 'src/shared/actions/notifications'
import {
  compositionUpdateFailed,
  compositionEnded,
} from 'src/shared/copy/notifications'

const APPROXIMATE_LSP_STARTUP_DELAY = 3000
const APPROXIMATE_EDITOR_SET_VALUE_DELAY = 1000

export class ConnectionManager extends AgnosticConnectionManager {
  private _worker: Worker
  private _preludeModel: MonacoTypes.editor.IModel
  private _variables: Variable[] = []

  constructor(worker: Worker) {
    super()
    this._worker = worker
    // note: LSP handle multiple documents, but does so in alphabetical order
    // create this model/uri first
    this._preludeModel = monaco.editor.createModel('', 'flux-prelude')
  }

  updatePreludeModel(variables: Variable[] = this._variables) {
    this._variables = variables
    const previousValue = this._preludeModel.getValue()

    try {
      const file = buildUsedVarsOption(this._model.getValue(), variables)
      const query = format_from_js_file(file)

      this._preludeModel.setValue(query)
      if (query != previousValue) {
        this._preludeModel.setValue(query)
        this._worker.postMessage(
          didChange(
            this._preludeModel.uri.toString(),
            query,
            this._preludeModel.getVersionId()
          )
        )
      }
    } catch (e) {
      console.error(e)
    }
  }

  subscribeToModel(editor: EditorType) {
    super.subscribeToModel(editor)

    this._model.onDidChangeContent(() => this.updatePreludeModel())
    this._worker.postMessage(
      didOpen(
        this._preludeModel.uri.toString(),
        this._preludeModel.getValue(),
        this._preludeModel.getVersionId()
      )
    )
  }

  subscribeToConnection(connection: MonacoLanguageClient) {
    // class: https://github.com/microsoft/vscode-languageserver-node/blob/f97bb73dbfb920af4bc8c13ecdcdc16359cdeda6/client/src/browser/main.ts#L13
    // extended from class: https://github.com/microsoft/vscode-languageserver-node/blob/d7b0ef6eab79f31f514f6559b6950326b170a691/client/src/common/client.ts#L431
    connection.onReady().then(() => {
      connection.onNotification(
        'window/showMessageRequest',
        (data: LspClientRequest) => {
          this.onLspMessage(data)
        }
      )
    })
  }

  inject(
    command: ExecuteCommand,
    data: Omit<ExecuteCommandArgument, 'textDocument'>
  ) {
    let msg
    try {
      msg = executeCommand([
        command,
        {
          ...data,
          textDocument: {uri: this._model.uri.toString()},
        },
      ] as ExecuteCommandT)
    } catch (err) {
      console.error(`Error ExecuteCommand:`, err)
      reportErrorThroughHoneyBadger(err, {
        name: 'LSP injection payload',
      })
      return
    }
    this._worker.postMessage(msg)
  }

  _updateLsp(
    toAdd: Partial<CompositionSelection>,
    toRemove: Partial<CompositionSelection> = null
  ) {
    if (toAdd.bucket) {
      this.inject(ExecuteCommand.CompositionInit, {
        bucket: toAdd.bucket.name,
      })
    }

    if (toAdd.measurement) {
      this.inject(ExecuteCommand.CompositionSetMeasurement, {
        value: toAdd.measurement,
      })
    }

    if (toRemove?.fields?.length) {
      toRemove.fields.forEach(value =>
        this.inject(ExecuteCommand.CompositionRemoveField, {value})
      )
    }
    if (toAdd.fields?.length) {
      toAdd.fields.forEach(value =>
        this.inject(ExecuteCommand.CompositionAddField, {value})
      )
    }
    if (toRemove?.tagValues?.length) {
      toRemove.tagValues.forEach(({key, value}) =>
        this.inject(ExecuteCommand.CompositionRemoveTagValue, {tag: key, value})
      )
    }
    if (toAdd.tagValues?.length) {
      toAdd.tagValues.forEach(({key, value}) =>
        this.inject(ExecuteCommand.CompositionAddTagValue, {tag: key, value})
      )
    }
  }

  _removeDefaultAndUpdateLsp(callbackToUpdateLsp: Function) {
    const disposeOfHandler = this._model.onDidChangeContent(e => {
      const modelResetValueApplied = e.changes.some(({range, text}) => {
        const isExpectedRange =
          range.startLineNumber === 1 &&
          range.endLineNumber === 1 &&
          range.endColumn - range.startColumn ===
            DEFAULT_FLUX_EDITOR_TEXT.length
        const isExpectedResetValue = text === ''
        return isExpectedRange && isExpectedResetValue
      })
      if (modelResetValueApplied) {
        setTimeout(
          () => callbackToUpdateLsp(),
          APPROXIMATE_EDITOR_SET_VALUE_DELAY
        )
      }
    })
    this._model.setValue('')
    setTimeout(
      () => disposeOfHandler.dispose(),
      APPROXIMATE_EDITOR_SET_VALUE_DELAY * 4
    )
  }

  _initLspComposition(toAdd: Partial<CompositionSelection>) {
    if (toAdd.bucket) {
      const payload = {
        bucket: toAdd.bucket?.name,
      }
      if (toAdd.measurement) {
        payload['measurement'] = toAdd.measurement
      }
      if (toAdd.fields) {
        payload['fields'] = toAdd.fields
      }
      if (toAdd.tagValues) {
        payload['tagValues'] = toAdd.tagValues.map(({key, value}) => [
          key,
          value,
        ])
      }
      this.inject(ExecuteCommand.CompositionInit, payload)
    }
  }

  onSchemaSessionChange(schema: CompositionSelection, sessionCb, dispatch) {
    const {shouldContinue, previousState} = this._updateLocalState(
      schema,
      sessionCb,
      dispatch
    )
    if (!shouldContinue) {
      return
    }

    const {toAdd, toRemove, shouldRemoveDefaultMsg} = this._diffSchemaChange(
      schema,
      previousState,
      DEFAULT_FLUX_EDITOR_TEXT
    )

    const hasMultipleItemsToSync =
      Object.keys(toAdd).length + Object.keys(toRemove).length > 1
    const hasChanges = Object.keys(toAdd).length || Object.keys(toRemove).length

    switch (
      `${this._first_load}|${hasMultipleItemsToSync}|${Boolean(hasChanges)}`
    ) {
      case 'true|false|true':
      case 'true|true|true':
        // on first load.
        this._first_load = false
        if (shouldRemoveDefaultMsg) {
          this._model.setValue('')
        }
        setTimeout(
          () => this._initLspComposition(toAdd),
          APPROXIMATE_LSP_STARTUP_DELAY
        )
        break
      case 'true|false|false':
        // first load, no composition.
        this._first_load = false
        break
      case 'false|true|true':
        // 1) re-sync just turned on or
        // 2) measurement selection is changed when fields
        //    and/or tag values were previously selected
        if (!toAdd.bucket) {
          // bucket is needed for initialization
          toAdd.bucket = schema.bucket
        }
        if (shouldRemoveDefaultMsg) {
          this._removeDefaultAndUpdateLsp(() => this._initLspComposition(toAdd))
        } else {
          this._initLspComposition(toAdd)
        }
        break
      case 'false|false|true':
        // normal update.
        if (shouldRemoveDefaultMsg) {
          this._removeDefaultAndUpdateLsp(() =>
            this._updateLsp(toAdd, toRemove)
          )
        } else {
          this._updateLsp(toAdd, toRemove)
        }
        break
      case 'false|false|false':
        // no composition change
        break
      default:
        console.error(
          `Unexpected branch conditional: ${
            this._first_load
          }|${hasMultipleItemsToSync}|${Boolean(hasChanges)}`
        )
    }
  }

  _performActionItems(actions: ActionItem[]) {
    actions.forEach((action: ActionItem) => {
      switch (action.title) {
        case ActionItemCommand.CompositionRange:
          this._setEditorBlockStyle(action.range, true)
          break
        case ActionItemCommand.CompositionState:
          if (action.state) {
            const selection: RecursivePartial<CompositionSelection> = {
              bucket: action.state.bucket ? this._session.bucket : null,
              measurement: action.state.measurement ?? null,
              fields: action.state.fields ?? [],
              tagValues:
                action.state.tag_values.map(
                  ([key, value]) => ({key, value} as TagKeyValuePair)
                ) ?? [],
            }
            this._callbackSetSession(selection)
          }
          break
        default:
          return
      }
    })
  }

  onLspMessage(requestFromLsp: LspClientRequest) {
    switch (requestFromLsp.message) {
      case LspClientCommand.AlreadyInitialized:
      case LspClientCommand.UpdateComposition:
        this._performActionItems(requestFromLsp.actions)
        break
      case LspClientCommand.ExecuteCommandFailed:
        this._dispatcher(notify(compositionUpdateFailed()))
        break
      case LspClientCommand.CompositionEnded:
        this._setEditorBlockStyle(null)
        if (this._model.getValue() !== DEFAULT_FLUX_EDITOR_TEXT) {
          // lost the flux sync. Note: ignore when this occurs during `New Script`.
          this._setSessionSync(false)
        }
        this._dispatcher(notify(compositionEnded()))
        break
      case LspClientCommand.CompositionNotFound:
        // Do nothing.
        // This can also occur whenever the File fails to parse to AST. (a.k.a. mid-typing syntax)
        break
      default:
        return
    }
  }
}
