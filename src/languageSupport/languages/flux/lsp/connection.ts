import isEqual from 'lodash/isEqual'
import * as MonacoTypes from 'monaco-editor/esm/vs/editor/editor.api'
import {format_from_js_file} from '@influxdata/flux-lsp-browser'

// handling variables
import {EditorType, Variable} from 'src/types'
import {buildUsedVarsOption} from 'src/variables/utils/buildVarsOption'

// handling schema composition
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

const ICON_SYNC_ON = 'composition-sync-icon-on'
const ICON_SYNC_OFF = 'composition-sync-icon-off'
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
  private _callbackSetSession: (schema: SchemaSelection) => void = () => null

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

  _setSchemaSync(synced: boolean) {
    this._callbackSetSession({
      ...this._session,
      composition: {...this._session.composition, synced},
    })
  }

  _setCompositionSyncToggle() {
    setTimeout(() => {
      const syncIconOn = document.getElementsByClassName(ICON_SYNC_ON)[0]
      const syncIconOff = document.getElementsByClassName(ICON_SYNC_OFF)[0]
      const syncIcon = syncIconOn || syncIconOff

      const clickableInvisibleDiv = document.getElementById(ICON_SYNC_ID)
      if (!syncIcon || !clickableInvisibleDiv) {
        return
      }
      clickableInvisibleDiv.style.top =
        ((syncIcon as any).offsetTop || 0) + 'px'
      clickableInvisibleDiv.style.left = (syncIcon as any).offsetLeft + 'px'
      clickableInvisibleDiv.style.height =
        ((syncIcon as any).offsetHeight || 0) + 'px'
      clickableInvisibleDiv.style.width =
        ((syncIcon as any).offsetWidth || 0) + 'px'

      clickableInvisibleDiv.removeEventListener('click', () =>
        this._setSchemaSync(!this._session.composition.synced)
      ) // may have existing
      clickableInvisibleDiv.addEventListener('click', () =>
        this._setSchemaSync(!this._session.composition.synced)
      )
    }, 1000)
  }

  _setCompositionIrreversibleExit(schema: SchemaSelection) {
    this._model.onDidChangeContent(e => {
      const {changes} = e
      changes.forEach(change => {
        if (
          change.range.startLineNumber >=
            (schema.composition.block?.startLine || COMPOSITION_INIT_LINE) &&
          change.range.endLineNumber <=
            (schema.composition.block?.endLine || COMPOSITION_INIT_LINE)
        ) {
          // TODO: eventually, will be based on LSP response
          this._callbackSetSession({
            ...this._session,
            composition: {synced: false, diverged: true},
          })
          return
        }
      })
    })
  }

  _setCompositionBlockSize() {
    const query = this._model.getValue()
    const endLine =
      query.split('\n').findIndex(line => line.includes(COMPOSITION_YIELD)) + 1
    this._callbackSetSession({
      ...this._session,
      composition: {
        ...this._session.composition,
        block: {startLine: COMPOSITION_INIT_LINE, endLine},
      },
    })
  }

  initComposition(schema: SchemaSelection) {
    // msg to LSP
    this._compositionInitLsp(schema)

    // handlers to trigger end composition
    this._setCompositionSyncToggle()
    this._setCompositionIrreversibleExit(schema)

    // handlers for composition block size
    // eventually, this could be from the LSP response. onLspCompositionChange()
    this._setCompositionBlockSize()
    this._model.onDidChangeContent(
      () => this._session.composition.synced && this._setCompositionBlockSize()
    )
  }

  _compositionInitLsp(schema: SchemaSelection) {
    // msg to LSP
    const {bucket, measurement} = schema
    const payload = {bucket: bucket?.name}
    if (measurement) {
      payload['measurement'] = measurement
    }
    // TODO: finish LSP update first
    // this.inject(ExecuteCommand.CompositionInit, payload)

    this._compositionUpdateLsp(schema)
  }

  _compositionUpdateLsp(schema: SchemaSelection) {
    const {fields, tags, tagValues} = schema
    if (fields.length) {
      // TODO: finish LSP update first
      // this.inject(ExecuteCommand.CompositionInit, payload)
    }
    if (tags.length) {
      // TODO: finish LSP update first
      // this.inject(ExecuteCommand.CompositionInit, payload)
    }
    if (tagValues.length) {
      // TODO: finish LSP update first
      // this.inject(ExecuteCommand.CompositionInit, payload)
    }

    // msg to monaco-editor
    this._setCompositionBlockStyle(schema)
  }

  // hack for now. To trigger for example video.
  private _turnOnWithFirstCall = true

  onSchemaSessionChange(schema: SchemaSelection, sessionCb) {
    if (!schema.composition) {
      console.error(
        'User has an old session, which does not support schema composition.'
      )
    }

    this._callbackSetSession = sessionCb
    const previousState = this._session
    this._session = {...schema}

    // hack for now. To trigger for example video.
    if (this._turnOnWithFirstCall) {
      this._turnOnWithFirstCall = false
      setTimeout(() => {
        console.error('MOCK SCHEMA INJECTION FROM USER')
        this.initComposition(schema)
      }, 5000)
      return
    }

    if (!isEqual(previousState?.composition, schema.composition)) {
      return this._setCompositionBlockStyle(schema)
    }

    // Else, presume change is rest of session's schema selection
    this._compositionUpdateLsp(schema)
  }

  onLspCompositionChange(_jsonrpcMiddlewareResponse: unknown) {
    // TODO: middleware to read LSP response => call this method
    // TODO: wait for successful LSP roundtrip, then use response for:
    // update (true-up) session store
    // all updates to this._setCompositionBlockStyle(), should occur post-roundtrip
  }

  _compositionIcon = (synced: boolean) => {
    return {
      linesDecorationsClassName: synced ? ICON_SYNC_ON : ICON_SYNC_OFF,
    }
  }

  _setCompositionBlockStyle({
    composition: {
      synced,
      block = {
        startLine: COMPOSITION_INIT_LINE,
        endLine: COMPOSITION_INIT_LINE,
      },
    },
  }: SchemaSelection) {
    const {startLine, endLine} = block
    const syncIcon = [
      {
        range: new MonacoTypes.Range(startLine, 1, startLine, 1),
        options: this._compositionIcon(synced),
      },
    ]

    const compositionBlock = synced
      ? [
          {
            range: new MonacoTypes.Range(startLine, 1, endLine, 1),
            options: {
              isWholeLine: true,
              inlineClassName: 'composition-block',
            },
          },
        ]
      : []

    this._compositionStyle = this._editor.deltaDecorations(
      this._compositionStyle,
      syncIcon.concat(compositionBlock as any)
    )
  }

  dispose() {
    this._model.onDidChangeContent(null)
  }
}

export default LspConnectionManager
