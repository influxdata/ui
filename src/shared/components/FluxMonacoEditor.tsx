// Libraries
import React, {FC, useEffect, useContext, useMemo, useRef} from 'react'
import {useSelector} from 'react-redux'
import {useRouteMatch} from 'react-router-dom'
import classnames from 'classnames'

// Components
import MonacoEditor, {monaco} from 'react-monaco-editor'
import ErrorBoundary from 'src/shared/components/ErrorBoundary'
import {MonacoServices} from 'monaco-languageclient'

// LSP
import FLUXLANGID from 'src/languageSupport/languages/flux/monaco.flux.syntax'
import THEME_NAME from 'src/languageSupport/languages/flux/monaco.flux.theme'
import {
  comments,
  submit,
} from 'src/languageSupport/languages/flux/monaco.flux.hotkeys'
import {registerAutogrow} from 'src/languageSupport/monaco.autogrow'
import {LspConnectionManager} from 'src/languageSupport/languages/flux/lsp/connection'
import {
  BrowserMessageReader,
  BrowserMessageWriter,
  createMessageConnection,
} from 'vscode-jsonrpc/browser'
import {
  MonacoLanguageClient,
  CloseAction,
  ErrorAction,
  createConnection,
} from 'monaco-languageclient'

// Contexts and State
import {EditorContext} from 'src/shared/contexts/editor'
import {PersistanceContext} from 'src/dataExplorer/context/persistance'
import {fluxQueryBuilder} from 'src/shared/selectors/app'
import {isOrgIOx} from 'src/organizations/selectors'

// Types
import {OnChangeScript} from 'src/types/flux'
import {EditorType, Variable} from 'src/types'
import {editor as monacoEditor} from 'monaco-editor'

import './MonacoEditor.scss'
import {isFlagEnabled} from 'src/shared/utils/featureFlag'
import {reportErrorThroughHoneyBadger} from 'src/shared/utils/errors'

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import fluxWorkerUrl from 'worker-plugin/loader!src/languageSupport/languages/flux/lsp/worker'

MonacoServices.install(monaco)

export interface EditorProps {
  script?: string
  onChangeScript: OnChangeScript
  onSubmitScript?: () => void
  autogrow?: boolean
  readOnly?: boolean
  autofocus?: boolean
  wrapLines?: 'off' | 'on' | 'bounded'
}

interface Props extends EditorProps {
  setEditorInstance?: (editor: EditorType) => void
  variables: Variable[]
}

// Monaco editor for editing flux
const FluxEditorMonaco: FC<Props> = ({
  script,
  onChangeScript,
  onSubmitScript,
  setEditorInstance,
  autogrow,
  readOnly,
  autofocus,
  wrapLines,
  variables,
}) => {
  const connectionManager = useRef<LspConnectionManager>(null)
  const {editor, setEditor} = useContext(EditorContext)
  const isFluxQueryBuilder = useSelector(fluxQueryBuilder)
  const sessionStore = useContext(PersistanceContext)
  const isIoxOrg = useSelector(isOrgIOx)
  const {path} = useRouteMatch()
  const isInFluxQueryBuilder =
    isFluxQueryBuilder && path === '/orgs/:orgID/data-explorer'
  const useSchemaComposition =
    isInFluxQueryBuilder && isFlagEnabled('schemaComposition')

  const wrapperClassName = classnames('qx-editor--monaco', {
    'qx-editor--monaco__autogrow': autogrow,
  })

  useEffect(() => {
    connectionManager.current?.updatePreludeModel(variables)
  }, [variables])

  useEffect(() => {
    if (useSchemaComposition) {
      connectionManager.current?.onSchemaSessionChange(
        sessionStore.selection,
        sessionStore.setSelection
      )
    }
  }, [
    useSchemaComposition,
    connectionManager,
    sessionStore?.selection,
    sessionStore?.selection.composition || null,
    sessionStore?.selection.resultOptions || null,
    sessionStore?.setSelection,
  ])

  useEffect(() => {
    if (!editor) {
      return
    }
    submit(editor, () => {
      if (onSubmitScript) {
        onSubmitScript()
      }
    })
  }, [editor, onSubmitScript])

  // When the editor renders, we can begin connecting dependent resources. For instance,
  // in this case, we set up the flux lsp's web worker api, initialize some extra state
  // around other open files, and connect that to the editor.
  const editorDidMount = (editor: EditorType) => {
    if (connectionManager.current != null) {
      console.warn(
        'editorDidMount called more than once. This may indicate a bug in react-monaco-editor.'
      )
      return
    }
    const worker = new Worker(fluxWorkerUrl)
    worker.onerror = (err: ErrorEvent) => {
      const error: Error = {...err, name: 'worker.onerror'}
      reportErrorThroughHoneyBadger(error, {name: 'LSP worker'})
    }
    worker.onmessage = _ => {
      // Listen for any message from the worker. That message will
      // be sent with the worker is ready to accept lsp messages. The
      // following interactions will replace this event handler entirely.
      const connection = createMessageConnection(
        new BrowserMessageReader(worker),
        new BrowserMessageWriter(worker)
      )
      connection.onError(([error, ,]: [Error, unknown, number]) => {
        reportErrorThroughHoneyBadger(error, {name: 'LSP worker'})
      })

      const languageClient = new MonacoLanguageClient({
        name: FLUXLANGID,
        clientOptions: {
          documentSelector: [FLUXLANGID],
          errorHandler: {
            error: () => ErrorAction.Continue,
            closed: () => CloseAction.DoNotRestart,
          },
        },
        connectionProvider: {
          get: (errorHandler, closeHandler) => {
            return Promise.resolve(
              createConnection(connection, errorHandler, closeHandler)
            )
          },
        },
      })
      const lspConnectionManager = new LspConnectionManager(worker, editor)
      connectionManager.current = lspConnectionManager
      const disposable = languageClient.start()
      connection.onClose(() => {
        disposable.dispose()
      })
      lspConnectionManager.updatePreludeModel(variables)

      setEditor(editor, lspConnectionManager)
      if (setEditorInstance) {
        setEditorInstance(editor)
      }

      comments(editor)

      if (autogrow) {
        registerAutogrow(editor)
      }

      monacoEditor.remeasureFonts()

      if (autofocus && !readOnly && !editor.hasTextFocus()) {
        const model = editor.getModel()
        editor.setPosition({
          lineNumber: model.getLineCount(),
          column: model.getLineLength(model.getLineCount()) + 1,
        })
        editor.focus()
      }
    }
  }

  return useMemo(
    () => (
      <ErrorBoundary>
        <div className={wrapperClassName} data-testid="flux-editor">
          <MonacoEditor
            language={FLUXLANGID}
            theme={THEME_NAME}
            value={script}
            onChange={onChangeScript}
            options={{
              fontSize: 13,
              fontFamily: '"IBMPlexMono", monospace',
              cursorWidth: 2,
              lineNumbersMinChars: 4,
              lineDecorationsWidth: 0,
              minimap: {
                renderCharacters: false,
              },
              overviewRulerBorder: false,
              automaticLayout: true,
              readOnly: readOnly || false,
              wordWrap: wrapLines ?? 'off',
              scrollBeyondLastLine: false,
            }}
            editorDidMount={editorDidMount}
          />
          {isFlagEnabled('uiSqlSupport') &&
            isIoxOrg &&
            isInFluxQueryBuilder && (
              <div className="monaco-editor__language">{FLUXLANGID}</div>
            )}
        </div>
      </ErrorBoundary>
    ),
    [isIoxOrg, onChangeScript, setEditor, useSchemaComposition, script]
  )
}

export default FluxEditorMonaco
