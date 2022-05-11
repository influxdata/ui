import {Lsp} from '@influxdata/flux-lsp-browser'
import {Methods} from 'src/languageSupport/languages/flux/lsp/utils'
import {start} from 'src/languageSupport/languages/flux/lsp/worker/lspConnector'

let i = 0
let o = 0
const initBuffer = new Array(100)
let serverStartSignaled = false
let initialized = false // ACK received from monaco
let server: Lsp

const insertBuffer = req => {
  initBuffer[i % 100] = req
  i++
}

const consumeInitBuffer = async () => {
  let msg = initBuffer[o % 100]
  do {
    const res = await server.send(JSON.stringify(msg))
    respond(res)
    o++
    msg = initBuffer[o % 100]
  } while (!!msg)
  return
}

const respond = msg => {
  try {
    const d = JSON.parse(msg)
    // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
    // @ts-ignore
    postMessage(d)
  } catch (_) {}
}

onmessage = function(e) {
  // Handle race condition, because LSP is lazy loaded while init messages are received.
  switch (`${e.data.method}|${serverStartSignaled}|${initialized}`) {
    case `${Methods.Initialize}|false|false`:
      serverStartSignaled = true
      const initMsg = e.data
      start().then(s => {
        server = s
        server.onMessage(d => respond(d))
        server.send(JSON.stringify(initMsg)).then(res => respond(res))
      })
      break
    case `${Methods.Initialize}|true|false`: // initialize already received
      break
    case `${Methods.Initialized}|true|false`:
    case `${Methods.Initialized}|true|true`:
      server.send(JSON.stringify(e.data)).then(async _ => {
        await consumeInitBuffer()
        initialized = true
      })
      break
    default:
      if (!initialized) {
        insertBuffer(e.data)
      } else {
        server.send(JSON.stringify(e.data)).then(res => respond(res))
      }
      break
  }
}
