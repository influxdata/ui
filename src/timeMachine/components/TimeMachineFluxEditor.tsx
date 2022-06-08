// Libraries
import React, {FC, lazy, Suspense, useContext, useMemo} from 'react'
import {useSelector, useDispatch} from 'react-redux'
import {
  RemoteDataState,
  SpinnerContainer,
  TechnoSpinner,
} from '@influxdata/clockface'

// Components
import FluxToolbar from 'src/timeMachine/components/FluxToolbar'

// Actions and Selectors
import {setActiveQueryText} from 'src/timeMachine/actions'
import {saveAndExecuteQueries} from 'src/timeMachine/actions/queries'

// Contexts
import {EditorContext, EditorProvider} from 'src/shared/contexts/editor'

// Utils
import {getActiveQuery, getActiveTimeMachine} from 'src/timeMachine/selectors'
import {event} from 'src/cloud/utils/reporting'

// Types
import {FluxToolbarFunction, FluxFunction, Variable} from 'src/types'

const FluxEditor = lazy(() => import('src/shared/components/FluxMonacoEditor'))

const TMFluxEditor: FC<{variables: Variable[]}> = props => {
  const dispatch = useDispatch()
  const activeQueryText = useSelector(getActiveQuery).text
  const {activeQueryIndex} = useSelector(getActiveTimeMachine)
  const {editor, injectFunction, injectVariable} = useContext(EditorContext)

  const handleSetActiveQueryText = React.useCallback(
    (text: string) => {
      dispatch(setActiveQueryText(text))
    },
    [dispatch]
  )

  const handleSubmitQueries = () => {
    dispatch(saveAndExecuteQueries())
  }

  const handleInsertVariable = (variableName: string): void => {
    injectVariable(variableName, handleSetActiveQueryText)
  }

  const handleInsertFluxFunction = (
    func: FluxToolbarFunction | FluxFunction
  ): void => {
    injectFunction(func, handleSetActiveQueryText)
  }

  const handleActiveQuery = React.useCallback(
    (text: string) => {
      const aggregateWindowText =
        '|> aggregateWindow(every: v.windowPeriod, fn: mean, createEmpty: false)'
      const [currentText] = activeQueryText.split(
        `\n  ${aggregateWindowText}\n`
      )

      if (
        activeQueryText.includes(aggregateWindowText) &&
        !text.trim().includes(aggregateWindowText) &&
        text.trim().includes(currentText.trim())
      ) {
        event('Aggregate window removed')
      }
      handleSetActiveQueryText(text)
    },
    [activeQueryText, handleSetActiveQueryText]
  )

  return useMemo(() => {
    return (
      <div className="flux-editor">
        <div className="flux-editor--left-panel">
          <Suspense
            fallback={
              <SpinnerContainer
                loading={RemoteDataState.Loading}
                spinnerComponent={<TechnoSpinner />}
              />
            }
          >
            <FluxEditor
              script={activeQueryText}
              variables={props.variables}
              onChangeScript={handleActiveQuery}
              onSubmitScript={handleSubmitQueries}
              autofocus
            />
          </Suspense>
        </div>
        <div className="flux-editor--right-panel">
          <FluxToolbar
            onInsertFluxFunction={handleInsertFluxFunction}
            onInsertVariable={handleInsertVariable}
          />
        </div>
      </div>
    )
  }, [activeQueryText, activeQueryIndex, props.variables, editor])
}

const TimeMachineFluxEditor = props => (
  <EditorProvider>
    <TMFluxEditor {...props} />
  </EditorProvider>
)

export {TimeMachineFluxEditor}

export default TimeMachineFluxEditor
