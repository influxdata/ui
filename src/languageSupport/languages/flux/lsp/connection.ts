import isEqual from 'lodash/isEqual'
import * as MonacoTypes from 'monaco-editor/esm/vs/editor/editor.api'
import {format_from_js_file} from 'src/languageSupport/languages/flux/parser'

// handling variables
import {EditorType, Variable} from 'src/types'
import {buildUsedVarsOption} from 'src/variables/utils/buildVarsOption'

// handling schema composition
import {RecursivePartial} from 'src/types'
import {
  DEFAULT_SELECTION,
  DEFAULT_FLUX_EDITOR_TEXT,
  CompositionSelection,
} from 'src/dataExplorer/context/persistance'
import {CompositionInitParams} from 'src/languageSupport/languages/flux/lsp/utils'
import {comments} from 'src/languageSupport/languages/flux/monaco.flux.hotkeys'

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

// Utils
import {event} from 'src/cloud/utils/reporting'

// hardcoded in LSP
const COMPOSITION_YIELD = '_editor_composition'

const findLastIndex = (arr, fn) =>
  (arr
    .map((val, i) => [i, val])
    .filter(([i, val]) => fn(val, i, arr))
    .pop() || [-1])[0]

class LspConnectionManager {
  private _worker: Worker
  private _editor: EditorType
  private _model: MonacoTypes.editor.IModel
  private _snapshot: MonacoTypes.editor.ITextSnapshot
  private _preludeModel: MonacoTypes.editor.IModel
  private _variables: Variable[] = []
  private _compositionStyle: string[] = []
  private _session: CompositionSelection = JSON.parse(
    JSON.stringify(DEFAULT_SELECTION)
  )
  private _callbackSetSession: (
    schema: RecursivePartial<CompositionSelection>
  ) => void = () => null

  // only add handlers on first page load.
  private _compositionHandlersSet = false

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

  _getCompositionBlockLines(query) {
    if (!query || !query.includes(COMPOSITION_YIELD)) {
      return null
    }
    const lines = query.split('\n')
    // monacoEditor line indexing starts at 1..n
    const endLine =
      lines.findIndex(line => line.includes(COMPOSITION_YIELD)) + 1
    const startLine =
      findLastIndex(lines.slice(0, endLine - 1), line =>
        line.includes('from(')
      ) + 1

    return {startLine, endLine}
  }

  _setSessionSync(synced: boolean) {
    this._callbackSetSession({
      composition: {synced},
    })
  }

  /// XXX: wiedld (27 Sep 2022) -- This heuristic is wrong.
  /// Currently, the only way we detect monaco-editor apply changes is with the change object.
  /// The change object only includes the replacement text, the position, and a little bit of editor-specific metadata.
  /// The change object does NOT include anything which states whether or not the change is from an LSP-request,
  /// (via the LSP applyEdit command).
  /// As a result, we guess that any edit which is replacing the composition block is coming from an LSP request.
  /// However, this heuristic fails for certain user-triggered events.
  /// Such as a hotkey "undo" [cmd+z] of the last LSP applyEdit,
  /// which generates a change object that looks exactly like an older applyEdit change.
  _editorChangeIsFromLsp(change) {
    return /^(from)(.|\n)*(\|> yield\(name: "_editor_composition"\)\n)$/.test(
      change.text
    )
  }

  _editorChangeIsWithinComposition(change) {
    const compositionBlock = this._getCompositionBlockLines(
      this._snapshot.read()
    )
    this._snapshot = this._model.createSnapshot()

    if (!compositionBlock) {
      return false
    }
    const {startLine, endLine} = compositionBlock

    const changeInBlock =
      change.range.startLineNumber >= startLine &&
      change.range.endLineNumber <= endLine

    const changeWithCompositionIdentifier =
      change.text.includes(COMPOSITION_YIELD)

    const isDeletion = change.text == ''
    let deletionFromBlock = false
    if (isDeletion) {
      const linesDeleted =
        change.range.endLineNumber - change.range.startLineNumber
      deletionFromBlock =
        change.range.startLineNumber >= startLine &&
        change.range.endLineNumber <= endLine + linesDeleted
    }

    return changeInBlock || changeWithCompositionIdentifier || deletionFromBlock
  }

  _setEditorIrreversibleExit() {
    this._model.onDidChangeContent(e => {
      const shouldDiverge = e.changes.some(
        change =>
          this._editorChangeIsWithinComposition(change) &&
          !this._editorChangeIsFromLsp(change)
      )
      if (shouldDiverge && !this._session.composition.diverged) {
        event('Schema composition diverged - disable Flux Sync toggle')
        this._callbackSetSession({
          composition: {synced: false, diverged: true},
        })
      }
    })

    comments(this._editor, selection => {
      const compositionBlock = this._getCompositionBlockLines(
        this._model.getValue()
      )
      if (!compositionBlock) {
        return
      }
      const {startLine, endLine} = compositionBlock
      if (
        selection.startLineNumber >= startLine &&
        selection.endLineNumber <= endLine
      ) {
        this._callbackSetSession({
          composition: {synced: false, diverged: true},
        })
      }
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

  _setEditorBlockStyle(schema: CompositionSelection = this._session) {
    const compositionBlock = this._getCompositionBlockLines(
      this._model.getValue()
    )

    const removeAllStyles = !compositionBlock || schema.composition.diverged

    this._compositionStyle = this._editor.deltaDecorations(
      this._compositionStyle,
      removeAllStyles
        ? []
        : this._compositionSyncStyle(
            compositionBlock?.startLine,
            compositionBlock?.endLine,
            schema.composition.synced
          )
    )
  }

  // XXX: wiedld (25 Aug 2022) - handling the absence of a middleware listener
  // race conditions occur when:
  // (1) LSP is booting up on page reload,
  // (2) too many executeCommands in a row, too quickly. e.g. re-syncing
  // TODO(wiedld): https://github.com/influxdata/ui/issues/5305
  private _initDelayBeforeConsume = true
  private _bufferComposition: [
    ExecuteCommand,
    Omit<ExecuteCommandArgument, 'textDocument'>
  ][] = []
  private _i = 0
  private _o = 0
  _insertBuffer = req => {
    this._bufferComposition[this._i % 100] = req
    this._i++
  }
  _incrementBuffer = () => {
    const msg = this._bufferComposition[this._o % 100]
    if (!!msg) {
      this.inject(...msg)
      this._o++
    }
    return
  }

  _addUpdatesToBuffer(
    toAdd: Partial<CompositionSelection>,
    toRemove: Partial<CompositionSelection>
  ) {
    /* order is important. This ordering must occur on several levels:
        (1) bucket & measurement changes must be applied first.
        (2) for array items (fields and tagValues):
            * remove all, before adding all from current.
            * such that on re-sync with the session store...it does a full replacement.
        (3) even if the Lsp received the executeCommands in order, it may not run these in order.
            * spec is purely atomic operations, without order mattering.
            * but since we require that the AddField etc has an init composition -- order does matter.
            * If on page reload:
                * we don't AddBucket before AddField --> it will fail.
                * we AddField twice too quickly, each will see the original text as having 0 fields
                  * therefore, each addField returns an applyEdit for 1 field
              * solution:
                  * short term:
                    * buffer of executeCommands, send to Lsp at a throttled pace (hack timeouts)
                  * longterm: middleware? changes in Lsp?
    */
    const numFieldChanges =
      (toAdd.fields?.length || 0) + (toRemove.fields?.length || 0)
    const numTagValueChanges =
      (toAdd.tagValues?.length || 0) + (toRemove.tagValues?.length || 0)
    const reInitBlock =
      toAdd.bucket ||
      toAdd.measurement ||
      numFieldChanges + numTagValueChanges > 1

    if (reInitBlock) {
      const payload: Partial<CompositionInitParams> = {
        bucket: toAdd.bucket?.name || this._session.bucket?.name,
      }
      if (toAdd.measurement || this._session.measurement) {
        payload['measurement'] = toAdd.measurement || this._session.measurement
      }
      if (toAdd.fields || this._session.fields) {
        payload['fields'] = toAdd.fields || this._session.fields
      }
      if (toAdd.tagValues || this._session.tagValues) {
        payload['tagValues'] = (toAdd.tagValues || this._session.tagValues).map(
          ({key, value}) => [key, value]
        )
      }
      this._insertBuffer([ExecuteCommand.CompositionInit, payload])
      return // re-initialize full block. no more requests needed.
    }

    if (toRemove.fields?.length) {
      toRemove.fields.forEach(value =>
        this._insertBuffer([ExecuteCommand.CompositionRemoveField, {value}])
      )
    }
    if (toAdd.fields?.length) {
      toAdd.fields.forEach(value =>
        this._insertBuffer([ExecuteCommand.CompositionAddField, {value}])
      )
    }
    if (toRemove.tagValues?.length) {
      toRemove.tagValues.forEach(({key, value}) =>
        this._insertBuffer([
          ExecuteCommand.CompositionRemoveTagValue,
          {tag: key, value},
        ])
      )
    }
    if (toAdd.tagValues?.length) {
      toAdd.tagValues.forEach(({key, value}) =>
        this._insertBuffer([
          ExecuteCommand.CompositionAddTagValue,
          {tag: key, value},
        ])
      )
    }
  }

  _updateLsp(
    toAdd: Partial<CompositionSelection>,
    toRemove: Partial<CompositionSelection> = null
  ) {
    this._addUpdatesToBuffer(toAdd, toRemove)

    if (!this._initDelayBeforeConsume) {
      setTimeout(() => this._incrementBuffer(), 0)
    }
  }

  _diffSchemaChange(
    schema: CompositionSelection,
    previousState: CompositionSelection
  ) {
    const toAdd: Partial<CompositionSelection> = {}
    const toRemove: Partial<CompositionSelection> = {}

    if (schema.bucket && previousState.bucket != schema.bucket) {
      toAdd.bucket = schema.bucket
    }
    if (toAdd.bucket && this._model.getValue() == DEFAULT_FLUX_EDITOR_TEXT) {
      // first time selecting bucket --> remove if default message
      this._model.setValue('')
    }
    if (schema.measurement && previousState.measurement != schema.measurement) {
      toAdd.measurement = schema.measurement
    }

    const currText = this._model.getValue()
    if (!isEqual(schema.fields, previousState.fields)) {
      toRemove.fields = previousState.fields.filter(f => currText.includes(f))
      toAdd.fields = schema.fields
    }
    if (!isEqual(schema.tagValues, previousState.tagValues)) {
      toRemove.tagValues = previousState.tagValues.filter(({value}) =>
        currText.includes(value)
      )
      toAdd.tagValues = schema.tagValues
    }

    return {toAdd, toRemove}
  }

  _initCompositionHandlers() {
    this._snapshot = this._model.createSnapshot()

    // handlers to trigger end composition
    this._setEditorIrreversibleExit()

    // XXX: wiedld (25 Aug 2022) - eventually, this should be from the LSP response.
    // Tie the middleware to LspConnectionManager.onLspMessage()
    // TODO(wiedld): https://github.com/influxdata/ui/issues/5305
    this._model.onDidChangeContent(e => {
      if (this._session.composition?.synced) {
        this._setEditorBlockStyle()

        const isAppliedEdit = e.changes.some(
          change =>
            this._editorChangeIsWithinComposition(change) &&
            this._editorChangeIsFromLsp(change)
        )
        if (isAppliedEdit) {
          setTimeout(() => this._incrementBuffer(), 0)
        }
      }
    })

    this._compositionHandlersSet = true
  }

  onSchemaSessionChange(schema: CompositionSelection, sessionCb) {
    if (!schema.composition) {
      // FIXME: message to user, to create a new script
      console.error(
        'User has an old session, which does not support schema composition.'
      )
      return
    }

    this._callbackSetSession = sessionCb
    const previousState = {
      ...this._session,
      composition: {...this._session?.composition},
    }

    // Even when not synced:
    // 1. update styles (e.g. turn off synced style, if not unsynced)
    // 2. update block sync toggle state, using this._session.composition.synced
    if (previousState.composition != schema.composition) {
      this._session.composition = {...schema.composition}
      this._setEditorBlockStyle(schema)
    }

    if (schema.composition.diverged || !schema.composition.synced) {
      return
    }

    this._session = {...schema, composition: {...schema.composition}}

    if (!this._compositionHandlersSet) {
      this._initCompositionHandlers()
      setTimeout(() => {
        // XXX: wiedld (25 Aug 2022) - cannot init composition until after didOpen file
        // hardcode a delay for now
        // TODO(wiedld): https://github.com/influxdata/ui/issues/5305
        this._initDelayBeforeConsume = false
        this._incrementBuffer()
      }, 3000)
    }

    const {toAdd, toRemove} = this._diffSchemaChange(schema, previousState)
    if (Object.keys(toAdd).length || Object.keys(toRemove).length) {
      this._updateLsp(toAdd, toRemove)
    }
  }

  onLspMessage(_jsonrpcMiddlewareResponse: unknown) {
    // TODO(wiedld): https://github.com/influxdata/ui/issues/5305
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
