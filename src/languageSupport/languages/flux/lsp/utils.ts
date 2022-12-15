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

const createRequest = (method: string, params: object = {}) => {
  return {
    jsonrpc: JSONRPC,
    method,
    params,
    id: Math.random().toString(),
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

/**
 * @typedef {object} ExecuteCommandParams
 * Base requirement of all ExecuteCommand requests.
 * @property {string} ExecuteCommandParams.textDocument - TextDocumentItem per spec https://microsoft.github.io/language-server-protocol/specifications/lsp/3.17/specification/#textDocumentItem
 */
interface ExecuteCommandParams {
  textDocument: {
    uri: string
  }
}

/**
 * @typedef {object} CompositionInitParams
 * @property {string} CompositionInitParams.bucket - bucket name,
 * @property {string} CompositionInitParams.measurement - measurement name,
 * @property {string[]} CompositionInitParams.fields - optional prop, an array field names,
 * @property {string[][]} CompositionInitParams.fields - optional prop, an array of tag key+value pairs
 */
export interface CompositionInitParams extends ExecuteCommandParams {
  bucket: string
  measurement?: string
  fields?: string[]
  tagValues?: string[][]
}

/**
 * @typedef {object} CompositionValueParams
 * @property {string} CompositionValueParams.value - the value in that execute command (e.g. field name, tag key),
 */
interface CompositionValueParams extends ExecuteCommandParams {
  value: string
}

/**
 * @typedef {object} CompositionTagValueParams
 * @property {string}  CompositionTagValueParams.tag - the key in that execute command (e.g. tag key)
 * @property {string}  CompositionTagValueParams.value - the value in that execute command (e.g. tag value),
 */
interface CompositionTagValueParams extends CompositionValueParams {
  tag: string
}

export type ExecuteCommandArgument =
  | CompositionInitParams
  | CompositionValueParams

/**
 * @typedef {array} ExecuteCommandT
 * Maps what `arguments` (params) are expected for each executeCommand `command`.
 * Per the spec:
 *     https://microsoft.github.io/language-server-protocol/specifications/lsp/3.17/specification/#executeCommandParams
 */
export type ExecuteCommandT =
  | [ExecuteCommand.CompositionInit, CompositionInitParams]
  | [ExecuteCommand.CompositionSetMeasurement, CompositionValueParams]
  | [ExecuteCommand.CompositionAddField, CompositionValueParams]
  | [ExecuteCommand.CompositionRemoveField, CompositionValueParams]
  | [ExecuteCommand.CompositionAddTagValue, CompositionTagValueParams]
  | [ExecuteCommand.CompositionRemoveTagValue, CompositionTagValueParams]

function validateExecuteCommandPayload([command, arg]: ExecuteCommandT):
  | boolean
  | never {
  const checkIsString = (arg, prop) => {
    if (!(arg[prop] && typeof arg[prop] === 'string')) {
      throw new Error(
        `${prop} should be type string, instead found: ${typeof arg[prop]}`
      )
    }
    return true
  }

  switch (command) {
    case ExecuteCommand.CompositionInit:
      return checkIsString(arg, 'bucket')
    case ExecuteCommand.CompositionSetMeasurement:
    case ExecuteCommand.CompositionAddField:
    case ExecuteCommand.CompositionRemoveField:
      return checkIsString(arg, 'value')
    case ExecuteCommand.CompositionAddTagValue:
    case ExecuteCommand.CompositionRemoveTagValue:
      return checkIsString(arg, 'tag') && checkIsString(arg, 'value')
    default:
      throw new Error(`unrecognized ExecuteCommand`)
  }
}

export const executeCommand = (payload: ExecuteCommandT): object | never => {
  validateExecuteCommandPayload(payload)
  const [command, arg] = payload
  return createRequest(Methods.ExecuteCommand, {
    command,
    arguments: [arg],
    workDoneProgressParams: {
      workDoneToken: null,
    },
  })
}

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

/**
 * @typedef {enum} ExecuteCommand
 * Command for the custom work the server can perform.
 *     * This enum in the string `command` provided here:
 *         * https://microsoft.github.io/language-server-protocol/specifications/lsp/3.17/specification/#executeCommandOptions
 *     * LSP server returns an applyEdit:
 *         * https://microsoft.github.io/language-server-protocol/specifications/lsp/3.17/specification/#workspace_executeCommand
 */
export enum ExecuteCommand {
  CompositionInit = 'fluxComposition/initialize',
  CompositionSetMeasurement = 'fluxComposition/setMeasurementFilter',
  CompositionAddField = 'fluxComposition/addFieldFilter',
  CompositionRemoveField = 'fluxComposition/removeFieldFilter',
  CompositionAddTagValue = 'fluxComposition/addTagValueFilter',
  CompositionRemoveTagValue = 'fluxComposition/removeTagValueFilter',
}
