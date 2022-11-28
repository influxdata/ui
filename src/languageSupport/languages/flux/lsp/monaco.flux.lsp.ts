// get the same "monaco-editor/esm/vs/editor/editor.api" object used by the react component
import {monaco} from 'react-monaco-editor'
import {
  MonacoLanguageClient,
  MessageConnection,
  CloseAction,
  ErrorAction,
  MonacoServices,
  createConnection,
} from 'monaco-languageclient'
import {
  BrowserMessageReader,
  BrowserMessageWriter,
  createMessageConnection,
} from 'vscode-jsonrpc/browser'
import ConnectionManager from 'src/languageSupport/languages/flux/lsp/connection'

// flux language support
import FLUXLANGID from 'src/languageSupport/languages/flux/monaco.flux.syntax'
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import {EditorType} from 'src/types'

// utils
import {reportErrorThroughHoneyBadger} from 'src/shared/utils/errors'

// install Monaco language client services
MonacoServices.install(monaco)

function createLanguageClient(
  connection: MessageConnection
): MonacoLanguageClient {
  return new MonacoLanguageClient({
    name: FLUXLANGID,
    clientOptions: {
      documentSelector: [FLUXLANGID],
      // disable the default error handler
      errorHandler: {
        error: () => ErrorAction.Continue,
        closed: () => CloseAction.DoNotRestart,
      },
    },
    // create a language client connection from the JSON RPC connection on demand
    connectionProvider: {
      get: (errorHandler, closeHandler) => {
        return Promise.resolve(
          createConnection(connection, errorHandler, closeHandler)
        )
      },
    },
  })
}

let worker: Worker, messageReader, messageWriter, manager

const handleConnectionClose = () => {
  reportErrorThroughHoneyBadger(new Error('LSP connection closed.'), {
    name: 'LSP worker',
  })
}

const handleConnectionError = ([error, ,]: [Error, unknown, number]) => {
  // LSP worker will not be stopped. Is only an unhandled error.
  reportErrorThroughHoneyBadger(error, {name: 'LSP worker'})
}

export function initLspWorker() {
  if (worker) {
    return
  }
  worker = new Worker(new URL('./worker/flux.worker.ts', import.meta.url))
  worker.onerror = (err: ErrorEvent) => {
    const error: Error = {...err, name: 'worker.onerror'}
    reportErrorThroughHoneyBadger(error, {name: 'LSP worker'})
  }
  manager = new ConnectionManager(worker)

  messageReader = new BrowserMessageReader(worker)
  messageWriter = new BrowserMessageWriter(worker)
  const connection = createMessageConnection(messageReader, messageWriter)
  const languageClient = createLanguageClient(connection)
  const disposable = languageClient.start()
  connection.onError(e => handleConnectionError(e))
  connection.onClose(() => {
    disposable.dispose()
    manager.dispose()
    handleConnectionClose()
  })
}
initLspWorker()

export function setupForReactMonacoEditor(editor: EditorType) {
  manager.subscribeToModel(editor)
  return manager
}
