import {Lsp} from '@influxdata/flux-lsp-browser'
import {Methods} from 'src/languageSupport/languages/flux/lsp/utils'

const respond = (msg, cb) => {
  try {
    // LSP spec permits a blank response
    if (!msg) {
      return
    }
    const d = JSON.parse(msg)
    cb(d)
  } catch (e) {
    console.error(e)
  }
}

/**
 * Reasons for this buffer:
 *    * loading times for the monaco-editor client, versus LSP server
 *    * the required ordering of bootup-messages btwn these two, + the UI messages.
 *
 * Details:
 *    * First, the loading of workers:
 *        * we lazy load the monaco-editor, including that lib's own worker, which takes time.
 *        * concurrently, we also load the LSP server thread, since that takes even longer to come online.
 *    * Next, these messages must occur in order:
 *          1. monaco-editor request initializing handshake (a.k.a. mutual capabilities).
 *          2. UI request for didOpen for variables file (Prelude file).
 *                * reason for order requirement:
 *                     * monaco-editor creates new FileID (new model objects) in order
 *                     * LSP assesses these files in order of the model ID
 *                     * LSP needs to know variable assignments first. `option v = {foo: bar}` before use of foo.
 *                * how solved:
 *                     * after monaco-editor initialize, it calls the ConnectionManager constructor.
 *                     * constructor() --> make prelude file/model.
 *          3. monaco-editor request for didOpen file.
 *                * this is the flux query file.
 *                * triggered on callback after ConnectionManager is instantiated.
 *      * since the LSP worker takes awhile to boot up:
 *            * this buffer ensures that these^^ messages are received by the LSP in order.
 *
 * If we boot up the LSP server entirely first, before the monaco-editor is loaded, we could hypothetically eliminate this buffer.
 * But it would substantially increase our load time, and trickle into CI test timings and variable parsing (in dashboard) etc.
 */
class Buffer {
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

async function start(cb): Promise<Lsp> {
  const {Lsp} = await import('@influxdata/flux-lsp-browser')
  const server = new Lsp()
  server.onMessage(d => respond(d, cb))
  server
    .run()
    .then(() => console.warn('lsp server has stopped'))
    .catch(err => console.error('lsp server has crashed', err))

  return server
}

const buffer = new Buffer()

onmessage = function (e) {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  buffer.send(e.data, postMessage)
}
