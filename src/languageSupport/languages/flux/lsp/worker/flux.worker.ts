import Buffer from 'src/languageSupport/languages/flux/lsp/worker/buffer'

const buffer = new Buffer()

onmessage = function(e) {
  // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
  // @ts-ignore
  buffer.send(e.data, postMessage)
}
