// Libraries
import React, {FC, createContext, useContext, useState} from 'react'
import {useDispatch} from 'react-redux'

// Components
import {DapperScrollbars} from '@influxdata/clockface'
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
}

const CodeSnippet: FC<Props> = ({text, label, testID}) => {
  const {transform} = useContext(Context)
  const dispatch = useDispatch()
  const _text = transform(text)
  const onCopy = () => {
    dispatch(
      notify(
        copyToClipboardSuccess(`${_text.slice(0, 30).trimRight()}...`, 'Script')
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
          <pre>
            <code>{_text}</code>
          </pre>
        </div>
      </DapperScrollbars>
      <div className="code-snippet--footer">
        <CopyButton text={_text} onCopy={onCopy} />
        {label && <label className="code-snippet--label">{label}</label>}
      </div>
    </div>
  )
}

export default CodeSnippet
