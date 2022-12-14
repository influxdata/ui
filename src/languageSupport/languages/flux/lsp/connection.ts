import {MonacoLanguageClient} from 'monaco-languageclient'
import isEqual from 'lodash/isEqual'
import * as MonacoTypes from 'monaco-editor/esm/vs/editor/editor.api'
import {format_from_js_file} from 'src/languageSupport/languages/flux/parser'

// handling variables
import {EditorType, Variable} from 'src/types'
import {buildUsedVarsOption} from 'src/variables/utils/buildVarsOption'

// handling schema composition
import {RecursivePartial, TagKeyValuePair} from 'src/types'
import {
  DEFAULT_SELECTION,
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
  LspRange,
} from 'src/languageSupport/languages/flux/lsp/types'

// Utils
import {reportErrorThroughHoneyBadger} from 'src/shared/utils/errors'
import {notify} from 'src/shared/actions/notifications'
import {
  compositionUpdateFailed,
  compositionEnded,
  oldSession,
} from 'src/shared/copy/notifications'

const APPROXIMATE_LSP_STARTUP_DELAY = 3000

export class ConnectionManager {
  private _worker: Worker
  private _editor: EditorType
  private _model: MonacoTypes.editor.IModel
  private _preludeModel: MonacoTypes.editor.IModel
  private _variables: Variable[] = []
  private _compositionStyle: string[] = []
  private _session: CompositionSelection = JSON.parse(
    JSON.stringify(DEFAULT_SELECTION)
  )
  private _callbackSetSession: (
    schema: RecursivePartial<CompositionSelection>
  ) => void = () => null
  private _dispatcher = _ => {}
  private _first_load = true

  constructor(worker: Worker) {
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
    this._editor = editor
    this._model = editor.getModel()

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

  _setSessionSync(synced: boolean) {
    this._callbackSetSession({
      composition: {synced},
    })
  }

  _compositionSyncStyle(startLine: number, endLine: number) {
    const classNamePrefix = 'composition-sync--on'

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

  _setEditorBlockStyle(range: LspRange | null) {
    const shouldRemoveAllStyles = range == null

    this._compositionStyle = this._editor.deltaDecorations(
      this._compositionStyle,
      shouldRemoveAllStyles
        ? []
        : this._compositionSyncStyle(range.start.line, range.end.line)
    )
  }

  _isNewScript(
    schema: CompositionSelection,
    previousState: CompositionSelection
  ): boolean {
    return previousState.bucket != null && schema.bucket == null
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

  _diffSchemaChange(
    schema: CompositionSelection,
    previousState: CompositionSelection
  ) {
    const toAdd: Partial<CompositionSelection> = {}
    const toRemove: Partial<CompositionSelection> = {}
    let shouldDelay = false

    if (this._isNewScript(schema, previousState)) {
      // no action to take.
      // `textDocument/didChange` --> will inform LSP to drop composition
      return {toAdd, toRemove, shouldDelay}
    }

    if (schema.bucket && previousState.bucket != schema.bucket) {
      toAdd.bucket = schema.bucket
      if (this._model.getValue() == DEFAULT_FLUX_EDITOR_TEXT) {
        // first time selecting bucket --> remove if default message
        this._model.setValue('')
        shouldDelay = true
      }
    }
    if (schema.measurement && previousState.measurement != schema.measurement) {
      toAdd.measurement = schema.measurement
    }
    if (!isEqual(schema.fields, previousState.fields)) {
      toRemove.fields = previousState.fields.filter(
        f => !schema.fields.includes(f)
      )
      toAdd.fields = schema.fields.filter(
        f => !previousState.fields.includes(f)
      )
    }
    if (!isEqual(schema.tagValues, previousState.tagValues)) {
      toRemove.tagValues = previousState.tagValues.filter(
        ({key, value}) =>
          !schema.tagValues.some(pair => pair.value == value && pair.key == key)
      )
      toAdd.tagValues = schema.tagValues.filter(
        ({key, value}) =>
          !previousState.tagValues.some(
            pair => pair.value == value && pair.key == key
          )
      )
    }

    return {toAdd, toRemove, shouldDelay}
  }

  onSchemaSessionChange(schema: CompositionSelection, sessionCb, dispatch) {
    if (!schema.composition) {
      dispatch(notify(oldSession()))
      return
    }

    this._dispatcher = dispatch
    this._callbackSetSession = sessionCb
    const previousState = {
      ...this._session,
      composition: {...this._session?.composition},
    }

    if (!schema.composition.synced) {
      return
    }

    this._session = {...schema, composition: {...schema.composition}}
    const {toAdd, toRemove, shouldDelay} = this._diffSchemaChange(
      schema,
      previousState
    )

    if (this._first_load) {
      this._first_load = false
      setTimeout(
        () => this._initLspComposition(toAdd),
        APPROXIMATE_LSP_STARTUP_DELAY
      )
      return
    }

    if (Object.keys(toAdd).length || Object.keys(toRemove).length) {
      // since this._diffSchemaChange() can set the model
      // we need the executeCommand to be issued after the model update
      if (shouldDelay) {
        setTimeout(() => this._updateLsp(toAdd, toRemove), 3000)
      } else {
        this._updateLsp(toAdd, toRemove)
      }
    }
  }

  _performActionItems(actions: ActionItem[]) {
    actions.forEach((action: ActionItem) => {
      switch (action.title) {
        case ActionItemCommand.CompositionRange:
          this._setEditorBlockStyle(action.range)
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
        if (this._model.getValue() != DEFAULT_FLUX_EDITOR_TEXT) {
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

  dispose() {
    this._model.onDidChangeContent(null)
  }
}
