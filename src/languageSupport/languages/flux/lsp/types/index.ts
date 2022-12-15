/**
 * "Methods" == per each request sent to the LSP, there is an associated method.
 *
 * Special methods:
 *    * the executeCommand method:
 *        * we construct this message request in the UI code (not the monaco-editor) --> send to the LSP
 *        * specific executeCommand structure (per spec) is typed in './executeCommand'
 *    * the showMessage method:
 *        * the LSP sends the UI this message request --> UI (not monaco-editor) performs downstream actions.
 *        * specific showMessage structure (per spec) is typed in './showMessage
 */

export * from './executeCommand'
export * from './methods'
export * from './showMessage'
