export * from './executeCommand'
export * from './showMessage'

/**
 * @typedef {enum} Methods
 * What LSP methods are provided per the spec:
 *    * see the `method` in the Request payload:
 *           * https://microsoft.github.io/language-server-protocol/specifications/lsp/3.17/specification/#requestMessage
 *    * These include the lifecycle methods:
 *           * https://microsoft.github.io/language-server-protocol/specifications/lsp/3.17/specification/#lifeCycleMessages
 *    * also includes an executeCommand method:
 *           * which is an extensible interface for custom work the server can perform.
 */
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
  ExecuteCommand = 'workspace/executeCommand',
}
