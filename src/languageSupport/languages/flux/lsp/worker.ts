// LSP worker code.
//
// IMPORTANT! All the code here will run in a web worker. This has ramifications in
// the environment, e.g. there is no console, no dom, etc.
import('@influxdata/flux-lsp-browser').then(({Lsp}) => {
  // Send a server-sourced message, e.g. Response or ServerRequest,
  // to the web worker consumer.
  const respond = (message: string) => {
    postMessage(JSON.parse(message))
  }

  const server = new Lsp()
  server.onMessage(message => respond(message))
  // We explicitly don't want to catch here. We want any error to bubble
  // up through the worker's onerror handler into the browser's error handling.
  // We can't use the honey badger error reporting here, as `window` doesn't
  // exist.
  server
    .run()
    .then(() => {
      throw Error('LSP server has closed.')
    })
    .catch(e => {
      console.error(e)
    })

  onmessage = async (message): Promise<void> => {
    const response = await server.send(JSON.stringify(message.data))
    // Responses from the server may be empty. In that case, discard them.
    // This is a guard specific to server responses; server requests may not
    // ever be empty.
    if (response !== undefined) {
      respond(response)
    }
  }
  // This empty message acts as a "ready" state. The other end will listen for this
  // message and continue its initialization of dependent resources.
  setTimeout(() => postMessage(''), 3000)
})
