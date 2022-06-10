// Libraries
import React, {FC, lazy, Suspense} from 'react'
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
import {getAllVariables} from 'src/variables/selectors'

// Contexts
import {EditorProvider} from 'src/shared/contexts/editor'
import {InjectionProvider} from 'src/shared/contexts/injection'

// Utils
import {getActiveQuery} from 'src/timeMachine/selectors'
import {event} from 'src/cloud/utils/reporting'

const FluxEditor = lazy(() => import('src/shared/components/FluxMonacoEditor'))

const TimeMachineFluxEditor: FC = () => {
  const dispatch = useDispatch()
  const activeQueryText = useSelector(getActiveQuery).text
  const variables = useSelector(getAllVariables)

  const handleSetActiveQueryText = React.useCallback(
    (text: string) => {
      dispatch(setActiveQueryText(text))
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
          <EditorProvider>
            <FluxEditor
              script={activeQueryText}
              variables={variables}
              onChangeScript={handleActiveQuery}
              onSubmitScript={handleSubmitQueries}
              autofocus
            />
          </EditorProvider>
        </Suspense>
      </div>
      <div className="flux-editor--right-panel">
        <FluxToolbar />
      </div>
    </div>
  )
}

export default () => (
  <InjectionProvider>
    <TimeMachineFluxEditor />
  </InjectionProvider>
)
