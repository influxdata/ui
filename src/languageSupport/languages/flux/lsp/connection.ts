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

  // handle schema composition, on reload.
  private _firstCompositionInit = false
  private _insertIntoBuffer = false
  private _initBufferComposition: [
    ExecuteCommand,
    Omit<ExecuteCommandArgument, 'textDocument'>
  ][] = []

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
    if (this._insertIntoBuffer) {
      return this._initBufferComposition.push([command, data])
    }

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
    if (!query.includes(COMPOSITION_YIELD)) {
      return null
    }
    const startLine = COMPOSITION_INIT_LINE
    const endLine =
      query.split('\n').findIndex(line => line.includes(COMPOSITION_YIELD)) + 1
    return {startLine, endLine}
  }

  _setSessionSync(synced: boolean) {
    this._callbackSetSession({
      composition: {synced},
    })
  }

  _setEditorSyncToggle() {
    setTimeout(() => {
      const clickableInvisibleDiv = document.getElementById(ICON_SYNC_ID)
      // add listeners
      clickableInvisibleDiv.removeEventListener('click', () =>
        this._setSessionSync(!this._session.composition.synced)
      ) // may have existing
      clickableInvisibleDiv.addEventListener('click', () =>
        this._setSessionSync(!this._session.composition.synced)
      )

      this._alignInvisibleDivToEditorBlock()
    }, 1000)
  }

  _editorChangeIsFromLsp(change) {
    return !!change.forceMoveMarkers
  }

  _setEditorIrreversibleExit() {
    this._model.onDidChangeContent(e => {
      const {changes} = e
      changes.some(change => {
        const compositionBlock = this._getCompositionBlockLines()
        if (!compositionBlock) {
          return
        }
        const {startLine, endLine} = compositionBlock
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

  _alignInvisibleDivToEditorBlock() {
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
    const compositionBlock = this._getCompositionBlockLines()
    if (!compositionBlock) {
      return
    }
    const {startLine, endLine} = compositionBlock

    // move div to match monaco-editor coordinates
    clickableInvisibleDiv.style.top = ((upperIcon as any).offsetTop || 0) + 'px'
    const height =
      ((lowerIcon as any).offsetHeight || 0) * (endLine - startLine + 1) +
      ((upperIcon as any).offsetTop || 0)
    clickableInvisibleDiv.style.height = height + 'px'
    // width size is always the same, defined in classname "sync-bar"
  }

  _setEditorBlockStyle() {
    const compositionBlock = this._getCompositionBlockLines()

    const startLineStyle = [
      {
        range: new MonacoTypes.Range(
          compositionBlock?.startLine,
          1,
          compositionBlock?.startLine,
          1
        ),
        options: {
          linesDecorationsClassName: ICON_SYNC_CLASSNAME,
        },
      },
    ]
    const endLineStyle = [
      {
        range: new MonacoTypes.Range(
          compositionBlock?.endLine,
          1,
          compositionBlock?.endLine,
          1
        ),
        options: {
          linesDecorationsClassName: ICON_SYNC_CLASSNAME,
        },
      },
    ]

    const removeAllStyles =
      !compositionBlock && this._session.composition.diverged

    this._compositionStyle = this._editor.deltaDecorations(
      this._compositionStyle,
      removeAllStyles ? [] : startLineStyle.concat(endLineStyle)
    )

    this._alignInvisibleDivToEditorBlock()
    const clickableInvisibleDiv = document.getElementById(ICON_SYNC_ID)
    clickableInvisibleDiv.className = this._session.composition.synced
      ? 'sync-bar sync-bar--on'
      : 'sync-bar sync-bar--off'

    if (removeAllStyles) {
      clickableInvisibleDiv.style.display = 'none'
    }
  }

  _updateLsp(
    toAdd: Partial<SchemaSelection>,
    toRemove: Partial<SchemaSelection> = null
  ) {
    if (toAdd.bucket) {
      const payload = {bucket: toAdd.bucket?.name}
      this.inject(ExecuteCommand.CompositionInit, payload)
    }
    if (toAdd.measurement) {
      this.inject(ExecuteCommand.CompositionInit, {
        bucket: this._session.bucket.name,
        measurement: toAdd.measurement,
      })
    }
    if (toAdd.fields?.length) {
      toAdd.fields.forEach(value =>
        this.inject(ExecuteCommand.CompositionAddField, {value})
      )
    } else if (toRemove.fields?.length) {
      toRemove.fields.forEach(value =>
        this.inject(ExecuteCommand.CompositionRemoveField, {value})
      )
    }
    if (toAdd.tagValues?.length) {
      toAdd.tagValues.forEach(({key, value}) =>
        this.inject(ExecuteCommand.CompositionAddTagValue, {tag: key, value})
      )
    } else if (toRemove.tagValues?.length) {
      toRemove.tagValues.forEach(({key, value}) =>
        this.inject(ExecuteCommand.CompositionRemoveTagValue, {tag: key, value})
      )
    }
  }

  _diffSchemaChange(schema: SchemaSelection, previousState: SchemaSelection) {
    const toAdd: Partial<SchemaSelection> = {}
    const toRemove: Partial<SchemaSelection> = {}

    if (schema.bucket && previousState.bucket != schema.bucket) {
      toAdd.bucket = schema.bucket
    }
    if (schema.measurement && previousState.measurement != schema.measurement) {
      toAdd.measurement = schema.measurement
    }

    if (previousState.fields?.length != schema.fields?.length) {
      toAdd.fields = [] // preserve order
      const existingFields = new Set(previousState.fields)
      schema.fields.forEach(f =>
        !existingFields.has(f) ? toAdd.fields.push(f) : existingFields.delete(f)
      )
      toRemove.fields = Array.from(existingFields)
    }

    if (previousState.tagValues?.length != schema.tagValues?.length) {
      toAdd.tagValues = [] // preserve order
      const existingTagValues = new Set(previousState.tagValues)
      schema.tagValues.forEach(f =>
        !existingTagValues.has(f)
          ? toAdd.tagValues.push(f)
          : existingTagValues.delete(f)
      )
      toRemove.tagValues = Array.from(existingTagValues)
    }

    return {toAdd, toRemove}
  }

  _restoreComposition(schema: SchemaSelection) {
    this._updateLsp(schema, {})
  }

  private _i = 0
  private _o = 0
  _insertBuffer = req => {
    this._initBufferComposition[this._i % 100] = req
    this._i++
  }
  _consumeInitBuffer = () => {
    this._insertIntoBuffer = false
    let msg = this._initBufferComposition[this._o % 100]
    while (!!msg) {
      this.inject(...msg)
      this._o++
      msg = this._initBufferComposition[this._o % 100]
    }
    return
  }

  _initComposition() {
    // handle race condition, on page reloads
    this._insertIntoBuffer = true
    setTimeout(() => this._consumeInitBuffer(), 2000)

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

    this._firstCompositionInit = true
  }

  onSchemaSessionChange(schema: SchemaSelection, sessionCb) {
    this._callbackSetSession = sessionCb
    const previousState = {
      ...this._session,
      composition: {...this._session?.composition},
    }
    this._session = {...schema, composition: {...schema.composition}}

    if (!schema.composition) {
      // FIXME: message to user, to create a new script
      console.error(
        'User has an old session, which does not support schema composition.'
      )
      return
    }

    // always update size of block denoted in the UI styles. Even if it's an unsynced block.
    if (previousState.composition != schema.composition) {
      this._setEditorBlockStyle()
    }

    if (!schema.composition.synced) {
      return
    }

    if (!this._firstCompositionInit) {
      this._initComposition()
    }

    if (!previousState.composition.synced && schema.composition.synced) {
      return this._restoreComposition(schema)
    }

    const {toAdd, toRemove} = this._diffSchemaChange(schema, previousState)
    if (Object.keys(toAdd).length || Object.keys(toRemove).length) {
      this._updateLsp(toAdd, toRemove)
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
