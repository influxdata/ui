import {
  ProtocolRequestType,
  ProtocolNotificationType,
} from 'vscode-languageserver-protocol'

export const makeRequestType = (method: string) => {
  return new ProtocolRequestType<any, any, any, any, any>(method)
}

export const makeNotificationType = (method: string) => {
  return new ProtocolNotificationType<any, any>(method)
}

const JSONRPC = '2.0',
  FLUXLANGID = 'flux'

const createNotification = (method: string, params: object = {}) => {
  return {
    jsonrpc: JSONRPC,
    method,
    params,
  }
}

export const didChange = (uri: string, text: string, version: number) => {
  return createNotification(Methods.didChange, {
    contentChanges: [{text}],
    textDocument: {
      uri,
      version,
    },
  })
}

export const didOpen = (uri: string, text: string, version: number) => {
  return createNotification(Methods.didOpen, {
    textDocument: {
      uri,
      languageId: FLUXLANGID,
      version,
      text,
    },
  })
}

export enum Methods {
  Initialize = 'initialize',
  Initialized = 'initialized',
  CompletionResolve = 'completionItem/resolve',
  Completion = 'textDocument/completion',
  Definition = 'textDocument/definition',
  didChange = 'textDocument/didChange',
  didOpen = 'textDocument/didOpen',
  didSave = 'textDocument/didSave',
  Highlight = 'textDocument/documentHighlight',
  Symbol = 'textDocument/documentSymbol',
  FoldingRange = 'textDocument/foldingRange',
  Hover = 'textDocument/hover',
  References = 'textDocument/references',
  Rename = 'textDocument/rename',
}
