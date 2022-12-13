/**
 * @typedef {enum} LspClientRequest
 * LSP server-initiated request, intended for UI response.
 *    * server request: https://microsoft.github.io/language-server-protocol/specifications/lsp/3.17/specification/#window_showMessageRequest
 */
export interface LspClientRequest {
  message: LspClientCommand
  type: LspClientRequestPriority
  actions: ActionItem[]
}

/**
 * @typedef {enum} LspClientCommand
 * The specific command from the LspServer, provided with the `LspClientRequest`.
 *    * request parameters `ShowMessageRequestParams`:
 *        * https://microsoft.github.io/language-server-protocol/specifications/lsp/3.17/specification/#showMessageRequestParams
 *    * this enum is the `message` string on the showMessageRequest.
 *        * provides the general command for the UI client.
 */
export enum LspClientCommand {
  UpdateComposition = 'fluxComposition/compositionState',
  CompositionEnded = 'fluxComposition/compositionEnded',
  CompositionNotFound = 'fluxComposition/compositionNotFound',
  ExecuteCommandFailed = 'fluxComposition/executeCommandFailed',
  AlreadyInitialized = 'fluxComposition/alreadyInitialized',
}

/**
 * @typedef {interface} ActionItems
 * The specific ActionItems, provided with an LspClientCommand.
 *    * with each `ShowMessageRequestParams`, an array of `ActionItems` may be provided.
 *    * the actionItems are a permissive structure, only requiring `title`:
 *        * https://docs.rs/lsp-types/latest/lsp_types/struct.MessageActionItem.html
 *        * the resulting json-rpc request message is `{title: <string>, ...otherProps}`
 */
export interface ActionItem {
  title: ActionItemCommand
  range?: LspRange
  state?: any
}

export enum ActionItemCommand {
  CompositionRange = 'CompositionRange',
  CompositionState = 'CompositionState',
}

export enum LspClientRequestPriority {
  ERROR = 1,
  INFO = 3,
}

export interface LspRange {
  start: LspPosition
  end: LspPosition
}

export interface LspPosition {
  column: number
  line: number
}
