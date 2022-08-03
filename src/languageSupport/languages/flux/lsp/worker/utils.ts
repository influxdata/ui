import {ServerUIEvent} from 'src/languageSupport/languages/flux/lsp/utils'

const code = ['Error', 'Warning', 'Info', 'Log']
let type = 1

export const respond = (msg, cb) => {
  if (type == 5) {
    type = 1
  }
  try {
    const d = JSON.parse(msg)
    cb(d)
    // Demonstrate `window/showMessage`
    cb({
      jsonrpc: '2.0',
      method: 'window/showMessage',
      params: {
        type,
        message: `LSP sent a '${code[type - 1]}' response.`,
      },
    })
    type++

    // Demonstrate `telemetry/event`
    cb({
      jsonrpc: '2.0',
      method: 'telemetry/event',
      params: {
        type: ServerUIEvent.ShowMessage,
        message: 'wordz wordz wordz',
      },
    })
  } catch (e) {
    console.error(e)
  }
}
