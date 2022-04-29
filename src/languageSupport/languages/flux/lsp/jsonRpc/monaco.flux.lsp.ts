// get the same "monaco-editor/esm/vs/editor/editor.api" object used by the react component
import {monaco} from 'react-monaco-editor'
import {
    MonacoLanguageClient, MessageConnection, CloseAction, ErrorAction,
    MonacoServices, createConnection
} from 'monaco-languageclient'
import {createMessageConnection, BrowserMessageReader, BrowserMessageWriter} from 'vscode-jsonrpc/browser'

// flux language support
import FLUXLANGID from 'src/languageSupport/languages/flux/monaco.flux.syntax'
// @ts-ignore
import fluxWorkerUrl from 'worker-plugin/loader!./worker/flux.worker'
import {Events, didOpen, /*makeRequestType, makeNotificationType, METHODS*/} from 'src/languageSupport/languages/flux/lsp/jsonRpc/utils'

// install Monaco language client services
MonacoServices.install(monaco)

function createLanguageClient(connection: MessageConnection): MonacoLanguageClient {
    return new MonacoLanguageClient({
        name: FLUXLANGID,
        clientOptions: {
            documentSelector: [FLUXLANGID],
            // disable the default error handler
            errorHandler: {
                error: () => ErrorAction.Continue,
                closed: () => CloseAction.DoNotRestart
            }
        },
        // create a language client connection from the JSON RPC connection on demand
        connectionProvider: {
            get: (errorHandler, closeHandler) => {
                return Promise.resolve(createConnection(connection, errorHandler, closeHandler))
            }
        }
    })
}

let worker: Worker,
    messageReader,
    messageWriter

export async function initLspWorker() {
    if (worker) return
    if (window.Worker) {
        console.log(Events.LaunchWorker)
        worker = new Worker(fluxWorkerUrl)

        messageReader = new BrowserMessageReader(worker)
        messageWriter = new BrowserMessageWriter(worker)
        const connection = createMessageConnection(messageReader, messageWriter)
        const languageClient = createLanguageClient(connection)
        const disposable = languageClient.start()
        connection.onClose(() => disposable.dispose())
        console.log(Events.MonacoClientStarted)

        console.log(Events.MainThreadUp)
    }
    // FIXME TODO: backup => on same thread
}
initLspWorker()

export function subscribeToModel(model: monaco.editor.IModel) {
    const uri = model.uri.toString()
    worker.postMessage(didOpen(uri, model.getValue(), model.getVersionId()))
}

export function setupForReactMonacoEditor(model: monaco.editor.IModel) {
    subscribeToModel(model)
}
