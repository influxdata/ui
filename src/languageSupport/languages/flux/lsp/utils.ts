import {
  ProtocolRequestType,
  ProtocolNotificationType,
} from 'vscode-languageserver-protocol'
import {
  ExecuteCommand,
  ExecuteCommandT,
  Methods,
} from 'src/languageSupport/languages/flux/lsp/types'

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
