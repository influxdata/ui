// Libraries
import React, {FC, createContext, useContext, useEffect, useState} from 'react'
import {useDispatch} from 'react-redux'

import {Prism as SyntaxHighlighter} from 'react-syntax-highlighter'
import {darcula} from 'react-syntax-highlighter/dist/cjs/styles/prism'

// Components
import {DapperScrollbars, InfluxColors} from '@influxdata/clockface'
import CopyButton from 'src/shared/components/CopyButton'

// Constants
import {copyToClipboardSuccess} from 'src/shared/copy/notifications'
import {notify} from 'src/shared/actions/notifications'

interface VariableMap {
  [name: string]: string
}

interface TemplateContextType {
  variables: VariableMap
  update: (vars: VariableMap) => void
  transform: (text: string) => string
}

const DEFAULT_TEMPLATE_CONTEXT: TemplateContextType = {
  variables: {},
  update: _ => {},
  transform: (text: string) => text,
}

export const Context = createContext<TemplateContextType>(
  DEFAULT_TEMPLATE_CONTEXT
)

export const transform = (text: string, vars: VariableMap) => {
  // based off of this: https://johnresig.com/blog/javascript-micro-templating/
  // see the previous implementation (search for TemplatedCodeSnippet)
  // removed in this PR for more context: https://github.com/influxdata/ui/pull/1346/files
  // eslint-disable-next-line @typescript-eslint/no-implied-eval
  const output = new Function(
    'vars',
    'var output=' +
      JSON.stringify(text).replace(/<%=(.+?)%>/g, '"+(vars["$1".trim()])+"') +
      ';return output;'
  )
  return output(vars)
}

interface ProviderProps {
  variables?: VariableMap
}

export const Provider: FC<ProviderProps> = ({variables, children}) => {
  const [vars, setVars] = useState(variables || {})
  const _transform = (text: string) => transform(text, vars)

  useEffect(() => {
    if (variables) {
      setVars(variables)
    }
  }, [variables])

  return (
    <Context.Provider
      value={{
        variables: vars,
        update: setVars,
        transform: _transform,
      }}
    >
      {children}
    </Context.Provider>
  )
}

interface Props {
  text: string
  label?: string
  testID?: string
  onCopy?: () => void
  type?: string
  showCopyControl?: boolean
  language?: string
}

const CodeSnippet: FC<Props> = ({
  text,
  label,
  testID,
  type,
  onCopy,
  showCopyControl = true,
  language = null,
}) => {
  const {transform} = useContext(Context)
  const dispatch = useDispatch()
  const _text = transform(text)
  const handleCopy = () => {
    if (typeof onCopy === 'function') {
      onCopy()
    }
    dispatch(
      notify(
        copyToClipboardSuccess(
          `${_text.slice(0, 30).trimRight()}...`,
          type ?? 'Script'
        )
      )
    )
  }

  return (
    <div className="code-snippet" data-testid={testID || 'code-snippet'}>
      <DapperScrollbars
        autoHide={false}
        autoSizeHeight={true}
        className="code-snippet--scroll"
      >
        <div className="code-snippet--text">
          {language === null ? (
            <pre>
              <code>{_text}</code>
            </pre>
          ) : (
            <SyntaxHighlighter
              language={language}
              style={darcula}
              customStyle={{backgroundColor: InfluxColors.Grey5}}
              codeTagProps={{style: {fontFamily: '"IBMPlexMono", monospace'}}}
            >
              {_text}
            </SyntaxHighlighter>
          )}
        </div>
      </DapperScrollbars>
      {(showCopyControl || label) && (
        <div className="code-snippet--footer">
          {showCopyControl && <CopyButton text={_text} onCopy={handleCopy} />}
          {label && <label className="code-snippet--label">{label}</label>}
        </div>
      )}
    </div>
  )
}

export default CodeSnippet
