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
import Prelude from 'src/languageSupport/languages/flux/lsp/prelude'

// flux language support
import FLUXLANGID from 'src/languageSupport/languages/flux/monaco.flux.syntax'
// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
// @ts-ignore
import fluxWorkerUrl from 'worker-plugin/loader!./worker/flux.worker'
import {EditorType} from 'src/types'

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

let worker: Worker, messageReader, messageWriter, prelude

export function initLspWorker() {
  if (worker) {
    return
  }
  if (window.Worker) {
    worker = new Worker(fluxWorkerUrl)
    prelude = new Prelude()

    messageReader = new BrowserMessageReader(worker)
    messageWriter = new BrowserMessageWriter(worker)
    const connection = createMessageConnection(messageReader, messageWriter)
    const languageClient = createLanguageClient(connection)
    const disposable = languageClient.start()
    connection.onClose(() => {
      disposable.dispose()
      prelude.dispose()
    })
  }
  // FIXME TODO: backup => on same thread
}
initLspWorker()

export function setupForReactMonacoEditor(editor: EditorType, context: any) {
  prelude.subscribeToModel(editor, worker, context)
  return prelude
}
