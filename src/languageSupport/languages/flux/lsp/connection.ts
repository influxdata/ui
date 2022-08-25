import * as MonacoTypes from 'monaco-editor/esm/vs/editor/editor.api'
import {format_from_js_file} from '@influxdata/flux-lsp-browser'

// handling variables
import {EditorType, Variable} from 'src/types'
import {buildUsedVarsOption} from 'src/variables/utils/buildVarsOption'

// handling schema composition
import {RecursivePartial} from 'src/types'
import {SchemaSelection} from 'src/dataExplorer/context/persistance'

// LSP methods
import {
  didOpen,
  didChange,
  executeCommand,
  ExecuteCommandArgument,
  ExecuteCommand,
  ExecuteCommandT,
} from 'src/languageSupport/languages/flux/lsp/utils'

// error reporting
import {reportErrorThroughHoneyBadger} from 'src/shared/utils/errors'

const ICON_SYNC_CLASSNAME = 'composition-sync'
export const ICON_SYNC_ID = 'schema-composition-sync-icon'

// hardcoded in LSP
const COMPOSITION_YIELD = '_editor_composition'
const COMPOSITION_INIT_LINE = 1

class LspConnectionManager {
  private _worker: Worker
  private _editor: EditorType
  private _model: MonacoTypes.editor.IModel
  private _preludeModel: MonacoTypes.editor.IModel
  private _variables: Variable[] = []
  private _compositionStyle: string[] = []
  private _session: SchemaSelection
  private _callbackSetSession: (
    schema: RecursivePartial<SchemaSelection>
  ) => void = () => null

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

  _getCompositionBlockLines() {
    const query = this._model.getValue()
    const startLine = COMPOSITION_INIT_LINE
    const endLine =
      (query.split('\n').findIndex(line => line.includes(COMPOSITION_YIELD)) ||
        0) + 1
    return {startLine, endLine}
  }

  _setSessionSync(synced: boolean) {
    this._callbackSetSession({
      composition: {synced},
    })
  }

  _setEditorSyncToggle() {
    setTimeout(() => {
      // elements in monaco-editor. positioned by editor.
      const syncIcons = document.getElementsByClassName(ICON_SYNC_CLASSNAME)

      // UI elements we control
      const clickableInvisibleDiv = document.getElementById(ICON_SYNC_ID)
      if (!syncIcons.length || !clickableInvisibleDiv) {
        return
      }

      const [upperIcon] = syncIcons
      let [, lowerIcon] = syncIcons
      if (!lowerIcon) {
        lowerIcon = upperIcon
      }
      const {startLine, endLine} = this._getCompositionBlockLines()

      // move div to match monaco-editor coordinates
      clickableInvisibleDiv.style.top =
        ((upperIcon as any).offsetTop || 0) + 'px'
      const height =
        ((lowerIcon as any).offsetHeight || 0) * (endLine - startLine + 1) +
        ((upperIcon as any).offsetTop || 0)
      clickableInvisibleDiv.style.height = height + 'px'
      // width size is always the same, defined in classname "sync-bar"

      // add listeners
      clickableInvisibleDiv.removeEventListener('click', () =>
        this._setSessionSync(!this._session.composition.synced)
      ) // may have existing
      clickableInvisibleDiv.addEventListener('click', () =>
        this._setSessionSync(!this._session.composition.synced)
      )
    }, 1000)
  }

  _editorChangeIsFromLsp(change) {
    return !!change.forceMoveMarkers
  }

  _setEditorIrreversibleExit() {
    this._model.onDidChangeContent(e => {
      const {changes} = e
      changes.some(change => {
        const {startLine, endLine} = this._getCompositionBlockLines()
        if (
          change.range.startLineNumber >= startLine &&
          change.range.endLineNumber <= endLine &&
          !this._editorChangeIsFromLsp(change) &&
          !this._session.composition.diverged
        ) {
          this._callbackSetSession({
            composition: {synced: false, diverged: true},
          })
          return
        }
      })
    })
  }

  _setEditorBlockStyle() {
    const {startLine, endLine} = this._getCompositionBlockLines()

    const startLineStyle = [
      {
        range: new MonacoTypes.Range(startLine, 1, startLine, 1),
        options: {
          linesDecorationsClassName: ICON_SYNC_CLASSNAME,
        },
      },
    ]
    const endLineStyle = [
      {
        range: new MonacoTypes.Range(endLine, 1, endLine, 1),
        options: {
          linesDecorationsClassName: ICON_SYNC_CLASSNAME,
        },
      },
    ]

    const removeAllStyles = this._session.composition.diverged

    this._compositionStyle = this._editor.deltaDecorations(
      this._compositionStyle,
      removeAllStyles ? [] : startLineStyle.concat(endLineStyle)
    )

    const clickableInvisibleDiv = document.getElementById(ICON_SYNC_ID)
    clickableInvisibleDiv.className = this._session.composition.synced
      ? 'sync-bar sync-bar--on'
      : 'sync-bar sync-bar--off'

    if (removeAllStyles) {
      clickableInvisibleDiv.style.display = 'none'
    }
  }

  _initLsp(schema: SchemaSelection) {
    const {bucket, measurement} = schema
    const payload = {bucket: bucket?.name}
    if (measurement) {
      payload['measurement'] = measurement
    }
    // TODO: finish LSP update first
    // this.inject(ExecuteCommand.CompositionInit, payload)
  }

  _updateLsp(_: SchemaSelection) {
    // TODO: finish LSP update first
    // this.inject(ExecuteCommand.Composition<Something>, payload)
  }

  _initComposition(schema: SchemaSelection) {
    if (!schema.composition.synced) {
      this._setSessionSync(true)
    }

    this._initLsp(schema)

    // handlers to trigger end composition
    this._setEditorSyncToggle()
    this._setEditorIrreversibleExit()

    // handlers for composition block size
    // eventually, this could be from the LSP response. onLspMessage()
    this._model.onDidChangeContent(
      () => this._session.composition?.synced && this._setEditorBlockStyle()
    )

    // TODO: for now, set style on init. Eventually use this.onLspMessage()
    this._setEditorBlockStyle()
  }

  _restoreComposition(schema: SchemaSelection) {
    this._initLsp(schema)
    this._updateLsp(schema)
  }

  onSchemaSessionChange(schema: SchemaSelection, sessionCb) {
    this._callbackSetSession = sessionCb
    const previousState = {
      ...this._session,
      composition: {...(this._session?.composition || {})},
    }
    this._session = {...schema, composition: {...schema.composition}}

    if (!schema.composition) {
      // FIXME: message to user, to create a new script
      console.error(
        'User has an old session, which does not support schema composition.'
      )
      return
    }

    if (!previousState.bucket && schema.bucket) {
      // TODO: if also already have fields and tagValues, then _restoreComposition()
      const hasFieldsOrTagvalues = false
      if (hasFieldsOrTagvalues) {
        return this._restoreComposition(schema)
      }
      return this._initComposition(schema)
    }

    // TODO: decide on tag and tagValues.
    // Inject on same or different lines? then...how model in session?
    const tagsDidUpdate = false

    if (
      previousState.fields?.length != schema.fields?.length ||
      tagsDidUpdate
    ) {
      return this._updateLsp(schema)
    }

    if (previousState.composition != schema.composition) {
      return this._setEditorBlockStyle()
    }
  }

  onLspMessage(_jsonrpcMiddlewareResponse: unknown) {
    // TODO: Q4
    // 1. middleware detects jsonrpc
    // 2. call this method
    // 3a. update (true-up) session store
    // 3b. this._setEditorBlockStyle()
  }

  dispose() {
    this._model.onDidChangeContent(null)
  }
}

export default LspConnectionManager
