import {Lsp as LspObject} from '@influxdata/flux-lsp-browser'
import {respond} from 'src/languageSupport/languages/flux/lsp/worker/utils'

export async function start(cb): Promise<LspObject> {
  const {Lsp} = await import('@influxdata/flux-lsp-browser')
  const server = new Lsp()
  server.onMessage(d => respond(d, cb))
  server
    .run()
    .then(() => console.warn('lsp server has stopped'))
    .catch(err => console.error('lsp server has crashed', err))

  return server
}
