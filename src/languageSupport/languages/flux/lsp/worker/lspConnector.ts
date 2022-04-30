import {Lsp} from '@influxdata/flux-lsp-browser'

export async function start(): Promise<Lsp> {
  console.log('async load lsp-wasm...')
  const {Lsp} = await import('@influxdata/flux-lsp-browser')
  console.log('...loaded lsp-wasm')

  const server = new Lsp()
  server
    .run()
    .then(() => console.warn('lsp server has stopped'))
    .catch(err => console.error('lsp server has crashed', err))

  return server
}
