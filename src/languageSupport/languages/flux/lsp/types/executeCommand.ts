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

export type ExecuteCommandArgument =
  | CompositionInitParams
  | CompositionValueParams

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
