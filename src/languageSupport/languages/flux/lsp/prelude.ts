import {monaco} from 'react-monaco-editor'
import {Store} from 'redux'
import {format_from_js_file} from '@influxdata/flux-lsp-browser'
import {AppState, LocalStorage, EditorType} from 'src/types'
import {getStore} from 'src/store/configureStore'
import {getAllVariables, asAssignment} from 'src/variables/selectors'
import {buildUsedVarsOption} from 'src/variables/utils/buildVarsOption'
import {didOpen} from 'src/languageSupport/languages/flux/lsp/utils'

class Prelude {
  private _model: monaco.editor.IModel
  private _preludeModel: monaco.editor.IModel
  private _store: Store<AppState & LocalStorage>

  constructor(store = getStore()) {
    this._store = store
    // note: LSP handle multiple documents, but does so in alphabetical order
    // create this model/uri first
    this._preludeModel = monaco.editor.createModel('', 'flux-prelude')
  }

  private _updatePreludeModel() {
    try {
      const previousValue = this._preludeModel.getValue()

      const variables = getAllVariables(this._store.getState())
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
        // console.log('sending prelude...')
        this._preludeModel.setValue(query)
      }
    } catch (e) {
      console.warn(e)
    }
  }

  subscribeToModel(editor: EditorType, worker: Worker) {
    this._model = editor.getModel()
    this._updatePreludeModel()

    console.log('EDITOR points to', editor.getModel().uri.toString())
    console.log('PRELUDE', this._preludeModel.uri.toString())

    this._model.onDidChangeContent(this._updatePreludeModel.bind(this))
    worker.postMessage(
      didOpen(
        this._preludeModel.uri.toString(),
        this._preludeModel.getValue(),
        this._preludeModel.getVersionId()
      )
    )
  }
}

export default Prelude
