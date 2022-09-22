// Libraries
import React, {FC, useEffect, useContext, useMemo, useState} from 'react'
import {useSelector} from 'react-redux'
import {useRouteMatch} from 'react-router-dom'
import classnames from 'classnames'

// Components
import MonacoEditor from 'react-monaco-editor'
import ErrorBoundary from 'src/shared/components/ErrorBoundary'
import {monaco} from 'react-monaco-editor'
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
//
// The editor dependencies for flux are complex. There is a web worker that is started up
// that proxies the wasm-based LSP server. Once that has loaded completely, the worker is
// provided to a connection manager object which opens the required files (models, in
// the monaco dialect) and does some coordination with those files. Once that connection
// manager is ready, the monaco editor itself is rendered.
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
  const [connectionManager, setConnectionManager] =
    useState<LspConnectionManager>(null)
  const {editor, setEditor} = useContext(EditorContext)
  const isFluxQueryBuilder = useSelector(fluxQueryBuilder)
  const sessionStore = useContext(PersistanceContext)
  const isIoxOrg = useSelector(isOrgIOx)
  const {path} = useRouteMatch()
  const isInFluxQueryBuilder =
    isFluxQueryBuilder && path === '/orgs/:orgID/data-explorer'

  useEffect(() => {
    const worker = new Worker(fluxWorkerUrl)

    worker.onmessage = _ => {
      // Listen for _any_ message from the worker. The first message will signal
      // a "ready" state. The work following that will replace this event handler
      // entirely.
      const connection = createMessageConnection(
        new BrowserMessageReader(worker),
        new BrowserMessageWriter(worker)
      )
      connection.onError(([error, ,]: [Error, unknown, number]) => {
        // LSP worker will not be stopped. Is only an unhandled error.
        reportErrorThroughHoneyBadger(error, {name: 'LSP worker'})
      })

      const languageClient = new MonacoLanguageClient({
        name: FLUXLANGID,
        clientOptions: {
          documentSelector: [FLUXLANGID],
          // disable the default error handler
          errorHandler: {
            error: () => ErrorAction.Continue,
            closed: () => CloseAction.DoNotRestart,
          },
        },
        // create a language client connection from the JSON RPC connection on demand
        connectionProvider: {
          get: (errorHandler, closeHandler) => {
            return Promise.resolve(
              createConnection(connection, errorHandler, closeHandler)
            )
          },
        },
      })
      const connectionManager = new LspConnectionManager(worker)
      const disposable = languageClient.start()
      connection.onClose(() => {
        disposable.dispose()
        connectionManager.dispose()
        reportErrorThroughHoneyBadger(new Error('LSP connection closed.'), {
          name: 'LSP worker',
        })
      })
      setConnectionManager(connectionManager)
    }
    worker.onerror = (err: ErrorEvent) => {
      const error: Error = {...err, name: 'worker.onerror'}
      reportErrorThroughHoneyBadger(error, {name: 'LSP worker'})
    }
  }, [])

  const useSchemaComposition =
    isFluxQueryBuilder &&
    path === '/orgs/:orgID/data-explorer' &&
    isFlagEnabled('schemaComposition')
  const wrapperClassName = classnames('flux-editor--monaco', {
    'flux-editor--monaco__autogrow': autogrow,
  })

  useEffect(() => {
    connectionManager?.updatePreludeModel(variables)
  }, [variables, connectionManager])

  useEffect(() => {
    if (useSchemaComposition) {
      connectionManager?.onSchemaSessionChange(
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

  const editorDidMount = (editor: EditorType) => {
    // connectionManager should never be null when this is called.
    connectionManager.subscribeToModel(editor)
    connectionManager.updatePreludeModel(variables)

    setEditor(editor)
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

  return useMemo(
    () => (
      <ErrorBoundary>
        {connectionManager != null && (
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
        )}
      </ErrorBoundary>
    ),
    [isIoxOrg, onChangeScript, setEditor, useSchemaComposition, script]
  )
}

export default FluxEditorMonaco
