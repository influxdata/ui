import * as MonacoTypes from 'monaco-editor/esm/vs/editor/editor.api'
import {format_from_js_file} from '@influxdata/flux-lsp-browser'

// handling variables
import {EditorType, Variable} from 'src/types'
import {buildUsedVarsOption} from 'src/variables/utils/buildVarsOption'

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

class LspConnectionManager {
  private _worker: Worker
  private _editor: EditorType
  private _model: MonacoTypes.editor.IModel
  private _preludeModel: MonacoTypes.editor.IModel
  private _variables: Variable[] = []
  private _compositionStyle: string[] = []

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

  _compositionIcon = (synced: boolean) => {
    return {
      linesDecorationsClassName: synced
        ? 'composition-sync-icon-on'
        : 'composition-sync-icon-off',
    }
  }

  setCompositionBlockStyle(
    synced: boolean,
    startLine: number,
    endLine: number
  ) {
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

  turnOffCompositionSync(startLine: number) {
    this.setCompositionBlockStyle(false, startLine, startLine)
  }

  dispose() {
    this._model.onDidChangeContent(null)
  }
}

export default LspConnectionManager
