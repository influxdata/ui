import * as worker from 'monaco-editor/esm/vs/editor/editor.worker'
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api'
import {LspServerManager} from 'src/languageSupport/languages/flux/lsp/dedicatedWorker/worker/lspServer'

let initialized = false

// used when provided by self.MonacoEnvironment.getWorkerUrl
self.onmessage = (e) => {
    console.log('self.onmessage', e)
    if (initialized) {
        return
    }

    initialized = true
    const serviceManager = new LspServerManager()

    worker.initialize((ctx: monaco.worker.IWorkerContext, createData) => {
        serviceManager.initialize(ctx, createData, 'worker.initialize()')
        return serviceManager
    })
}

export {create} from 'src/languageSupport/languages/flux/lsp/dedicatedWorker/worker/lspServer'