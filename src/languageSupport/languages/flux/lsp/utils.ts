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

interface ExecuteCommandParams {
  textDocument: {
    uri: string
  }
}

export interface ExecuteCommandInjectMeasurement extends ExecuteCommandParams {
  name: string
  bucket: string
}

export type ExecuteCommandInjectTag = ExecuteCommandInjectMeasurement

export interface ExecuteCommandInjectTagValue extends ExecuteCommandInjectTag {
  value: string
}

export type ExecuteCommandInjectField = ExecuteCommandInjectMeasurement

export interface CompositionInitParams {
  bucket: string
  measurement?: string
  fields?: string[]
  tagValues?: string[]
}

interface CompositionValueParams extends ExecuteCommandParams {
  value: string
}

interface CompositionTagValueParams extends CompositionValueParams {
  tag: string
}

export type ExecuteCommandArgument =
  | ExecuteCommandInjectMeasurement
  | ExecuteCommandInjectTag
  | ExecuteCommandInjectTagValue
  | ExecuteCommandInjectField
  | CompositionInitParams
  | CompositionValueParams

export type ExecuteCommandT =
  | [ExecuteCommand.InjectionMeasurement, ExecuteCommandInjectMeasurement]
  | [ExecuteCommand.InjectTag, ExecuteCommandInjectTag]
  | [ExecuteCommand.InjectTagValue, ExecuteCommandInjectTagValue]
  | [ExecuteCommand.InjectField, ExecuteCommandInjectField]
  | [ExecuteCommand.CompositionInit, CompositionInitParams]
  | [ExecuteCommand.CompositionAddMeasurement, CompositionValueParams]
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
    case ExecuteCommand.InjectionMeasurement:
      return checkIsString(arg, 'bucket')
    case ExecuteCommand.InjectTag:
    case ExecuteCommand.InjectField:
      return checkIsString(arg, 'bucket') && checkIsString(arg, 'name')
    case ExecuteCommand.InjectTagValue:
      return (
        checkIsString(arg, 'bucket') &&
        checkIsString(arg, 'name') &&
        checkIsString(arg, 'value')
      )
    case ExecuteCommand.CompositionInit:
      return checkIsString(arg, 'bucket')
    case ExecuteCommand.CompositionAddMeasurement:
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

export enum ExecuteCommand {
  InjectionMeasurement = 'injectMeasurementFilter',
  InjectField = 'injectFieldFilter',
  InjectTag = 'injectTagFilter',
  InjectTagValue = 'injectTagValueFilter',
  CompositionInit = 'fluxComposition/initialize',
  CompositionAddMeasurement = 'fluxComposition/addMeasurementFilter',
  CompositionAddField = 'fluxComposition/addFieldFilter',
  CompositionRemoveField = 'fluxComposition/removeFieldFilter',
  CompositionAddTagValue = 'fluxComposition/addTagValueFilter',
  CompositionRemoveTagValue = 'fluxComposition/removeTagValueFilter',
}
