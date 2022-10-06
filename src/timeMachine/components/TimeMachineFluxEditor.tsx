// Libraries
import React, {FC, lazy, Suspense, useState} from 'react'
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
import {EditorProvider} from 'src/shared/contexts/editor'

// Utils
import {getActiveQuery} from 'src/timeMachine/selectors'
import {event} from 'src/cloud/utils/reporting'

// Types
import {Variable} from 'src/types'

const FluxEditor = lazy(() => import('src/shared/components/FluxMonacoEditor'))

const TMFluxEditor: FC<{variables: Variable[]}> = props => {
  const dispatch = useDispatch()
  const activeQueryText = useSelector(getActiveQuery).text
  const [monacoInput, setMonacoInput] = useState(activeQueryText)
  let userIdleTimer

  const handleSetActiveQueryText = React.useCallback(
    (text: string) => {
      setMonacoInput(text)

      // only send to redux when the user hasn't typed for one second.
      clearTimeout(userIdleTimer)
      userIdleTimer = setTimeout(() => {
        dispatch(setActiveQueryText(text))
      }, 1000)
    },
    [dispatch]
  )

  const handleSubmitQueries = () => {
    dispatch(saveAndExecuteQueries())
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
            script={monacoInput}
            variables={props.variables}
            onChangeScript={handleActiveQuery}
            onSubmitScript={handleSubmitQueries}
            autofocus
          />
        </Suspense>
      </div>
      <div className="flux-editor--right-panel">
        <FluxToolbar />
      </div>
    </div>
  )
}

const TimeMachineFluxEditor = props => (
  <EditorProvider>
    <TMFluxEditor {...props} />
  </EditorProvider>
)

export {TimeMachineFluxEditor}

export default TimeMachineFluxEditor
