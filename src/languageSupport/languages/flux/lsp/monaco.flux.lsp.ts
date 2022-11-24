// get the same "monaco-editor/esm/vs/editor/editor.api" object used by the react component
import {monaco} from 'react-monaco-editor'
import {
  MonacoLanguageClient,
  MessageConnection,
  CloseAction,
  ErrorAction,
  MonacoServices,
  createConnection,
  // OutputChannel,
} from 'monaco-languageclient'
import {
  BrowserMessageReader,
  BrowserMessageWriter,
  createMessageConnection,
  RequestType,
} from 'vscode-jsonrpc/browser'
import ConnectionManager from 'src/languageSupport/languages/flux/lsp/connection'

// flux language support
import FLUXLANGID from 'src/languageSupport/languages/flux/monaco.flux.syntax'
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import fluxWorkerUrl from 'worker-plugin/loader!./worker/flux.worker'
import {EditorType} from 'src/types'

// utils
import {reportErrorThroughHoneyBadger} from 'src/shared/utils/errors'

// install Monaco language client services
MonacoServices.install(monaco)

/// used as mock object. See outcome below.
// export class Output implements OutputChannel {
//   info(message: string, data?: any, _showNotification: boolean = true): void {
//     console.log('Output > info', message, data)
//   }
//   warn(message: string, data?: any, _showNotification: boolean = true): void {
//     console.log('Output > warn', message, data)
//   }
//   error(message: string, data?: any, _showNotification: boolean = true): void {
//     console.log('Output > error', message, data)
//   }
//   append(value: string): void {
//     console.log('Output > append > value:', value)
//   }
//   appendLine(line: string): void {
//     console.log('Output > appendLine > line:', line)
//   }
//   show(_preserveFocus?: boolean): void {}
//   dispose(): void {}
// }

function createLanguageClient(
  connection: MessageConnection
): MonacoLanguageClient {
  const languageClient = new MonacoLanguageClient({
    name: FLUXLANGID,
    /// Tried different clientOptions configuration.
    /// https://github.com/microsoft/vscode-languageserver-node/blob/d7b0ef6eab79f31f514f6559b6950326b170a691/client/src/common/client.ts#L313-L344
    clientOptions: {
      documentSelector: [FLUXLANGID],
      errorHandler: {
        error: () => ErrorAction.Continue,
        closed: () => CloseAction.DoNotRestart,
      },
      /// OUTCOME -- `outputChannel`:
      // this output channel is not used in the showMessage.
      // Doubled checked anyways, by providing the mock.
      // outputChannel: new Output(),
      middleware: {
        /// OUTCOME -- `middleware`:
        // did not find anything to use for showMessage.
        // the `middleware.window` only includes:
        //      `showDocument?: (this: void, params: ShowDocumentParams, next: ShowDocumentRequest.HandlerSignature) => Promise<ShowDocumentResult>;`
        //      this^^ is a server-initiated event: https://microsoft.github.io/language-server-protocol/specifications/lsp/3.17/specification/#window_showDocument
        //      But it only includes strict payloads. Pro: has range. Con: cannot send error messages. Con: is not really spec-compliant for our needs.
      },

      /// OUTCOME -- `connectionOptions.messageStrategy`
      /// ** never tried to get this one working, since other approach worked.**
      /// see here: https://github.com/microsoft/vscode-languageserver-node/blob/ff679a848eee142c9461b9942c3d97bbc94cdd32/jsonrpc/src/common/connection.ts#L718-L733
      // src code can be tracked back to issue ticket, which on it's surface looks like what we want too.
      // (A.k.a. adding another message handler, which gets applied before the message queue is incremented.)
      // But it's a heavier lift to use this API (have to define sender/receiver/cancellation policy). So did not continue.
      //   connectionOptions: {
      //     cancellationStrategy: {
      //       receiver: {
      //         createCancellationTokenSource(id: CancellationId): AbstractCancellationTokenSource;
      //         dispose?(): void;
      //       },
      //       sender: {
      //         sendCancellation(conn: MessageConnection, id: CancellationId): void;
      //         cleanup(id: CancellationId): void;
      //         dispose?(): void;
      //       },
      //     },
      //     messageStrategy: <THE PART WE REALLY CARE ABOUT>
      //   },
    },

    connectionProvider: {
      get: (errorHandler, closeHandler) => {
        // OUTCOME: is not triggered
        /// Tried APIs on the adaptor (`languageClientConnection` type `IConnection`).
        // This connects the message buffer, to the monaco-editor.
        // The API definition is a bunch of nested/spread props -> use typescript compiled interface definition files.
        const languageClientConnection = createConnection(
          connection,
          errorHandler,
          closeHandler
        )
        // languageClientConnection.onLogMessage((...params) =>
        //   console.log('languageClientConnection.onLogMessage', params)
        // )
        // languageClientConnection.onShowMessage((...params) =>
        //   console.log('languageClientConnection.onShowMessage', params)
        // )
        // languageClientConnection.onRequest('window/showMessageRequest', (...params) => {
        //   console.log('anguageClientConnection.onRequest() > params:', params);
        // });
        return Promise.resolve(languageClientConnection)
      },
    },
  })

  /// OUTCOME: SUCCESS!
  /// Tried listeners on the instatiated languageClient.
  // (note: links are updated APIs, so can version bump if needed.)
  /// class: https://github.com/microsoft/vscode-languageserver-node/blob/f97bb73dbfb920af4bc8c13ecdcdc16359cdeda6/client/src/browser/main.ts#L13
  /// extended from class: https://github.com/microsoft/vscode-languageserver-node/blob/d7b0ef6eab79f31f514f6559b6950326b170a691/client/src/common/client.ts#L431
  languageClient.onReady().then(() => {
    languageClient.onRequest('window/showMessageRequest', (...data) => {
      console.log('languageClient.onRequest > use string', data)
    })
    languageClient.onNotification('window/showMessage', (...data) => {
      console.log('languageClient.onNotification > use string', data)
    })
    const type = new RequestType('window/showMessageRequest')
    languageClient.onRequest(type, (...data) => {
      console.log('languageClient.onRequest > use type', data)
    })
  })
  return languageClient
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
  worker = new Worker(fluxWorkerUrl)
  worker.onerror = (err: ErrorEvent) => {
    const error: Error = {...err, name: 'worker.onerror'}
    reportErrorThroughHoneyBadger(error, {name: 'LSP worker'})
  }
  manager = new ConnectionManager(worker)

  messageReader = new BrowserMessageReader(worker)
  messageWriter = new BrowserMessageWriter(worker)
  const connection = createMessageConnection(messageReader, messageWriter)
  /// OUTCOME: none are triggered
  /// Tried listeners on the message buffer.
  /// https://github.com/microsoft/vscode-languageserver-node/blob/e3b566dc9e6ae60fa3d6641c3bb480634e4a0ad8/jsonrpc/src/common/connection.ts#L407
  // connection.onRequest('window/showMessageRequest', (...data) => {
  //   console.log('connection.onRequest > window/showMessageRequest', data)
  // })
  // connection.onNotification('window/showMessage', (...data) => {
  //   console.log('connection.onNotification > window/showMessage', data)
  // })
  // const type = new RequestType('window/showMessageRequest');
  // connection.onRequest(type, (...data) => {
  //   console.log('connection.onRequest > receive-request', data)
  // })
  // connection.onRequest((...data) => {
  //   console.log('connection.onRequest > any request', data)
  // })
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
