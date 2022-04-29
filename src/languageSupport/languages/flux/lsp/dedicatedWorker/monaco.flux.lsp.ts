// Libraries
import {Lsp} from '@influxdata/flux-lsp-browser'
// get the same "monaco-editor/esm/vs/editor/editor.api" object used by the react component
import {monaco} from 'react-monaco-editor'

// flux language support
import FLUXLANGID from 'src/languageSupport/languages/flux/monaco.flux.syntax'
// @ts-ignore
import fluxWorkerUrl from 'worker-plugin/loader!./worker/flux.worker'
// @ts-ignore
import fluxServerUrl from 'worker-plugin/loader!./worker/lspServer'


export function pointToFluxWorkerUrl() {
  self.MonacoEnvironment = {
    getWorkerUrl(_, __) {
      return fluxWorkerUrl
    },
  }
}
export function pointToFluxWorker() {
  self.MonacoEnvironment = {
    getWorker(_, __) {
      return new Worker(fluxWorkerUrl)
    },
  }
}

export async function initEditorWorker(uri) {
  // consumes the lambda provided to initialize() --> setting the foreignModuleFactory
  const fluxWorker = await monaco.editor.createWebWorker<Lsp>({
    label: FLUXLANGID,
    moduleId: fluxWorkerUrl,
    createData: { data: 'TODO init settings' },
  }) as  monaco.editor.MonacoWebWorker<Lsp>

  fluxWorker.withSyncedResources([uri])
}

export function subscribeToModel(model: monaco.editor.IModel) {
  model.onDidChangeContent((x) => {
    console.log('onDidChangeContent', x)
  })
}

export function setupForReactMonacoEditor(model: monaco.editor.IModel) {
  pointToFluxWorker()
  setTimeout(() => initEditorWorker(model.uri), 5000)
  subscribeToModel(model)
}
