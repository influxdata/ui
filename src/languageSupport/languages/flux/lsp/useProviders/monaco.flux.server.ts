import Deferred from 'src/utils/Deferred'
import {
  LSPResponse,
  parseResponse,
  initialize,
  LSPMessage,
  completion,
  didOpen,
  didChange,
  NotificationMessage,
  signatureHelp,
  foldingRange,
  rename,
  references,
  definition,
  symbols,
  formatting,
} from 'src/languageSupport/languages/flux/lsp/useProviders/monaco.flux.messages'
// import {registerCompletion} from 'src/languageSupport/languages/flux/lsp/monaco.flux.lsp'

import {AppState, LocalStorage} from 'src/types'
import {getAllVariables, asAssignment} from 'src/variables/selectors'
import {buildVarsOption} from 'src/variables/utils/buildVarsOption'

import {getStore} from 'src/store/configureStore'

import {Store} from 'redux'
import {
  CompletionItem,
  CompletionContext,
  SignatureHelp,
  Position,
  Diagnostic,
  FoldingRange,
  WorkspaceEdit,
  Location,
  SymbolInformation,
  TextEdit,
} from 'monaco-languageclient/lib/services'
import {Lsp} from '@influxdata/flux-lsp-browser'
import {ProtocolToMonacoConverter} from 'monaco-languageclient/lib/monaco-converter'

import {format_from_js_file} from '@influxdata/flux-lsp-browser'
export class LSPServer {
  private server: Lsp
  private messageID: number = 0
  private documentVersions: {[key: string]: number} = {}
  public store: Store<AppState & LocalStorage>
  private p2m: ProtocolToMonacoConverter

  constructor(server: Lsp, reduxStore = getStore()) {
    this.server = server
    this.server.onMessage(this.onMessage)
    this.store = reduxStore
    this.p2m = new ProtocolToMonacoConverter(monaco)
    this.server
      .run()
      .then(() => console.warn('lsp server has stopped'))
      .catch(err => console.error('lsp server has crashed', err))
  }

  onMessage = (msg: string) => {
    const response = parseResponse(msg) as NotificationMessage
    switch (response.method) {
      case 'textDocument/publishDiagnostics': {
        this.updateDiagnostics(response.params)
        break
      }
      default: {
        console.warn('unsupported lsp message type received')
        break
      }
    }
  }

  updateDiagnostics = params => {
    try {
      const results = this.p2m.asDiagnostics(params?.diagnostics)
      monaco.editor.setModelMarkers(
        monaco.editor.getModel(params?.uri),
        'default',
        results
      )
    } catch (e) {
      console.error('updateDiagnostics error', e)
    }
  }

  initialize() {
    return this.send(initialize(this.currentMessageID))
  }

  async rename(uri, position, newName): Promise<WorkspaceEdit> {
    const response = (await this.send(
      rename(this.currentMessageID, uri, position, newName)
    )) as {result: WorkspaceEdit}

    return response.result
  }

  async definition(uri, position): Promise<Location> {
    const response = (await this.send(
      definition(this.currentMessageID, uri, position)
    )) as {result: Location}

    return response.result
  }

  async symbols(uri): Promise<SymbolInformation[]> {
    const response = (await this.send(symbols(this.currentMessageID, uri))) as {
      result: SymbolInformation[]
    }

    return response.result
  }

  async references(uri, position, context): Promise<Location[]> {
    const response = (await this.send(
      references(this.currentMessageID, uri, position, context)
    )) as {result: Location[]}

    return response.result
  }

  async foldingRanges(uri): Promise<FoldingRange[]> {
    const response = (await this.send(
      foldingRange(this.currentMessageID, uri)
    )) as {result: FoldingRange[]}

    return response.result
  }

  async signatureHelp(uri, position, context): Promise<SignatureHelp> {
    await this.sendPrelude(uri)

    const response = (await this.send(
      signatureHelp(this.currentMessageID, uri, position, context)
    )) as {result: SignatureHelp}

    return response.result
  }

  async formatting(uri): Promise<TextEdit[]> {
    await this.sendPrelude(uri)

    const response = (await this.send(
      formatting(this.currentMessageID, uri)
    )) as {result: TextEdit[]}

    return response.result
  }

  async completionItems(
    uri: string,
    position: Position,
    context: CompletionContext
  ): Promise<CompletionItem[]> {
    await this.sendPrelude(uri)
    console.log('IN SAME THREAD')

    try {
      const response = (await this.send(
        completion(
          this.currentMessageID,
          uri,
          {...position, line: position.line},
          context
        )
      )) as {result?: {items?: []}}

      return (response.result || {}).items || []
    } catch (e) {
      return []
    }
  }

  async didOpen(uri: string, script: string) {
    await this.sendPrelude(uri)
    const response = await this.send(
      didOpen(this.currentMessageID, uri, script, 1)
    )
    this.documentVersions[uri] = 1

    return this.parseDiagnostics(response as NotificationMessage)
  }

  async didChange(uri: string, script: string) {
    await this.sendPrelude(uri)
    const version = this.documentVersions[uri] || 1
    const response = await this.send(
      didChange(this.currentMessageID, uri, script, version + 1)
    )
    this.documentVersions[uri] = version + 1

    return this.parseDiagnostics(response as NotificationMessage)
  }

  private parseDiagnostics(response: NotificationMessage): Diagnostic[] {
    if (
      response?.method === 'textDocument/publishDiagnostics' &&
      response?.params
    ) {
      const {diagnostics} = response.params as {diagnostics: Diagnostic[]}

      return diagnostics || []
    }

    return []
  }

  private get currentMessageID(): number {
    const result = this.messageID
    this.messageID++
    return result
  }

  private async send(message: LSPMessage): Promise<LSPResponse> {
    const body = JSON.stringify(message)
    const response = await this.server.send(body)
    return parseResponse(response)
  }

  private async sendPrelude(uri: string): Promise<void> {
    const state = this.store.getState()

    // NOTE: we use the AST intermediate format as a means of reducing
    // drift between the parser and the internal representation
    const variables = getAllVariables(state)
      .map(v => asAssignment(v))
      .filter(v => !!v)
    const file = buildVarsOption(variables)
    const parts = uri.split('/')
    parts.pop()
    const dir = parts.join('/')
    const path = `${dir}/prelude.flux`

    const prelude = format_from_js_file(file)
    await this.send(didOpen(this.currentMessageID, path, prelude, 0))
  }
}

export class LSPLoader {
  private server: LSPServer
  private queue: Deferred<LSPServer>[] = []
  private loading: boolean = false

  async load() {
    if (this.server) {
      return this.server
    }

    const deferred = new Deferred<LSPServer>()

    if (this.loading) {
      this.queue.push(deferred)
      return await deferred.promise
    }

    this.loading = true

    const {Lsp, initLog} = await import('@influxdata/flux-lsp-browser')
    initLog()
    this.server = new LSPServer(new Lsp())
    // registerCompletion(monaco, this.server)

    await this.server.initialize()

    this.queue.forEach(d => d.resolve(this.server))

    return this.server
  }
}

const serverLoader = new LSPLoader()

export default async function loader(): Promise<LSPServer> {
  return await serverLoader.load()
}
