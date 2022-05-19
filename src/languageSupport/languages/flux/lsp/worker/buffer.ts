import {Lsp} from '@influxdata/flux-lsp-browser'
import {Methods} from 'src/languageSupport/languages/flux/lsp/utils'
import {start} from 'src/languageSupport/languages/flux/lsp/worker/lspConnector'
import {respond} from 'src/languageSupport/languages/flux/lsp/worker/utils'

export default class Buffer {
  private _i = 0
  private _o = 0
  private _initBuffer = new Array(100)
  private _serverStartSignaled = false
  private _initialized = false // ACK received from monaco
  private _server: Lsp

  private _insertBuffer = req => {
    this._initBuffer[this._i % 100] = req
    this._i++
  }

  private _consumeInitBuffer = async cb => {
    let msg = this._initBuffer[this._o % 100]
    do {
      const res = await this._server.send(JSON.stringify(msg))
      respond(res, cb)
      this._o++
      msg = this._initBuffer[this._o % 100]
    } while (!!msg)
    return
  }

  send(data, cb) {
    // Handle race condition, because LSP is lazy loaded while init messages are received.
    switch (
      `${data.method}|${this._serverStartSignaled}|${this._initialized}`
    ) {
      case `${Methods.Initialize}|false|false`:
        this._serverStartSignaled = true
        const initMsg = data
        start(cb).then(s => {
          this._server = s
          this._server
            .send(JSON.stringify(initMsg))
            .then(res => respond(res, cb))
        })
        break
      case `${Methods.Initialize}|true|false`: // initialize already received
        break
      case `${Methods.Initialized}|true|false`:
      case `${Methods.Initialized}|true|true`:
        this._server.send(JSON.stringify(data)).then(async _ => {
          await this._consumeInitBuffer(cb)
          this._initialized = true
        })
        break
      default:
        if (!this._initialized) {
          this._insertBuffer(data)
        } else {
          this._server.send(JSON.stringify(data)).then(res => respond(res, cb))
        }
        break
    }
  }
}
