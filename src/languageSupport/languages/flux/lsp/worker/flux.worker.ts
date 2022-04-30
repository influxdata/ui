import {Lsp} from '@influxdata/flux-lsp-browser'
import {Events, Methods} from 'src/languageSupport/languages/flux/lsp/utils'
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
    // console.log('> to lsp:', msg)
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
    // console.log('> from LSP:', d)
    // @ts-ignore
    postMessage(d)
  } catch (_) {}
}

onmessage = function(e) {
  switch (`${e.data.method}|${serverStartSignaled}|${initialized}`) {
    case `${Methods.Initialize}|false|false`:
      serverStartSignaled = true
      const initMsg = e.data
      start().then(s => {
        console.log(Events.LspServerUp)
        server = s
        // @ts-ignore
        server.onMessage(d => respond(d))
        // console.log('> to lsp:', initMsg)
        server.send(JSON.stringify(initMsg)).then(res => respond(res))
        console.log(Events.WorkerThreadUp)
      })
      break
    case `${Methods.Initialize}|true|false`: // initialize already received
      break
    case `${Methods.Initialized}|true|false`:
    case `${Methods.Initialized}|true|true`:
      // console.log('> to lsp:', e.data)
      server.send(JSON.stringify(e.data)).then(async _ => {
        await consumeInitBuffer()
        initialized = true
      })
      break
    default:
      if (!initialized) {
        insertBuffer(e.data)
      } else {
        // console.log('> to lsp:', e.data)
        server.send(JSON.stringify(e.data)).then(res => respond(res))
      }
      break
  }
}
