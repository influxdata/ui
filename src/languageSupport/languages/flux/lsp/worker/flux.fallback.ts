import Buffer from 'src/languageSupport/languages/flux/lsp/worker/buffer'

export default class Fallback extends EventTarget implements Worker {
  private _buffer

  constructor() {
    super()
    this._buffer = new Buffer()
  }

  // will be overwritten by the BrowserMessageReader
  // https://github.com/microsoft/vscode-languageserver-node/blob/d58c00bbf8837b9fd0144924db5e7b1c543d839e/jsonrpc/src/browser/main.ts
  onmessage(_) {}

  // inbound from rest of main thread `fallbackWorker.postMessage()`
  postMessage(data) {
    this._buffer.send(data, res => {
      const evt: MessageEvent = new MessageEvent('message', {data: res})
      this.onmessage(evt)
    })
  }

  onmessageerror(e) {
    console.warn(e)
  }
  onerror(e) {
    console.warn(e)
  }
  terminate() {}
}
