// LSP worker code
//
// The LSP must be run inside a web worker, as it does sychronous, CPU-bound
// tasks on data that can be quite large. This web worker acts as the runtime
// environment for the LSP as specified by Monaco.
//
// IMPORTANT! As this is a web worker, the environment isn't the same as the
// browser, e.g. there is no dom, potentially no console, etc.
import('@influxdata/flux-lsp-browser').then(({Lsp}) => {
  // Send a JSON-parseable message to the client.
  const sendToClient = (message: string) => {
    postMessage(JSON.parse(message))
  }

  const server = new Lsp()
  server.onMessage(message => sendToClient(message))
  // We explicitly don't want to catch here. We want any error to bubble up
  // through the worker's onerror handler, into the browser's error handling.
  // Additionally, we can't use the honey badger error reporting here, as
  // `window` doesn't exist.
  server.run().then(() => {
    throw Error('LSP server has closed.')
  })

  onmessage = async (message): Promise<void> => {
    const response = await server.send(JSON.stringify(message.data))
    // Some responses from the server may be empty, e.g.
    // `textDocument/didChange`. In that case, discard them. This is
    // a guard specific to server responses; server requests may not
    // ever be empty.
    if (response !== undefined) {
      sendToClient(response)
    }
  }

  // This empty message acts as a "ready" state signifier. The other end will
  // listen for this message and continue its initialization of dependent resources.
  postMessage('')
})
