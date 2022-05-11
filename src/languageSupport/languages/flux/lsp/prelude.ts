import {Store} from 'redux'
import * as MonacoTypes from 'monaco-editor/esm/vs/editor/editor.api'
import {format_from_js_file} from '@influxdata/flux-lsp-browser'
import {AppState, LocalStorage, EditorType} from 'src/types'

// handling variables
import {getStore} from 'src/store/configureStore'
import {getAllVariables, asAssignment} from 'src/variables/selectors'
import {
  TIME_RANGE_START,
  TIME_RANGE_STOP,
  // WINDOW_PERIOD, TODO: handle WINDOW_PERIOD?
} from 'src/variables/constants'
import {getRangeVariable} from 'src/variables/utils/getTimeRangeVars'
import {FlowContextType} from 'src/flows/context/flow.current'
import {buildUsedVarsOption} from 'src/variables/utils/buildVarsOption'

// LSP methods
import {didOpen} from 'src/languageSupport/languages/flux/lsp/utils'

class Prelude extends EventTarget {
  private _model: MonacoTypes.editor.IModel
  private _preludeModel: MonacoTypes.editor.IModel
  private _store: Store<AppState & LocalStorage>
  private _context: FlowContextType
  private _unsubscribe

  constructor(store = getStore()) {
    super()
    this._store = store
    // note: LSP handle multiple documents, but does so in alphabetical order
    // create this model/uri first
    this._preludeModel = monaco.editor.createModel('', 'flux-prelude')
  }

  _updatePreludeModel() {
    try {
      const previousValue = this._preludeModel.getValue()

      const variablesFromRedux = getAllVariables(this._store.getState())
      let variables = variablesFromRedux
      if (this._context?.flow) {
        // if in flow context, override timeRange variables from redux
        const {flow} = this._context
        const timeVars = [
          getRangeVariable(TIME_RANGE_START, flow.range),
          getRangeVariable(TIME_RANGE_STOP, flow.range),
        ]
        variables = variables.map(v => {
          if (v.id == TIME_RANGE_START && !!timeVars[0]) {
            return timeVars[0]
          }
          if (v.id == TIME_RANGE_STOP && !!timeVars[1]) {
            return timeVars[1]
          }
          return v
        })
      }

      const variableAssignments = variables
        .map(v => asAssignment(v))
        .filter(v => !!v)
      const file = buildUsedVarsOption(
        this._model.getValue(),
        variables,
        variableAssignments
      )
      const query = format_from_js_file(file)

      if (query != previousValue) {
        this._preludeModel.setValue(query)
      }
    } catch (e) {
      console.warn(e)
    }
  }

  private _subscribeToStore() {
    this._unsubscribe = this._store.subscribe(
      this._updatePreludeModel.bind(this)
    )
  }

  private _subscribeToFlowContext(context: FlowContextType) {
    this._context = context
  }

  subscribeToModel(editor: EditorType, worker: Worker, context: any) {
    this._subscribeToFlowContext(context)
    this._model = editor.getModel()
    this._updatePreludeModel()

    this._model.onDidChangeContent(this._updatePreludeModel.bind(this))
    this._subscribeToStore()
    worker.postMessage(
      didOpen(
        this._preludeModel.uri.toString(),
        this._preludeModel.getValue(),
        this._preludeModel.getVersionId()
      )
    )
  }

  dispose() {
    this._unsubscribe()
  }
}

export default Prelude
