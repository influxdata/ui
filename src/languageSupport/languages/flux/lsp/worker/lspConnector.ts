import {Lsp as LspObject} from '@influxdata/flux-lsp-browser'

export async function start(): Promise<LspObject> {
  const {Lsp} = await import('@influxdata/flux-lsp-browser')
  const server = new Lsp()
  server
    .run()
    .then(() => console.warn('lsp server has stopped'))
    .catch(err => console.error('lsp server has crashed', err))

  return server
}
