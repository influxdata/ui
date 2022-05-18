// Libraries
import React, {FC, lazy, Suspense, useState, useMemo} from 'react'
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

// Utils
import {getActiveQuery, getActiveTimeMachine} from 'src/timeMachine/selectors'
import {generateImport} from 'src/timeMachine/utils/insertFunction'
import {event} from 'src/cloud/utils/reporting'
import {CLOUD} from 'src/shared/constants'
import {isFlagEnabled} from 'src/shared/utils/featureFlag'
import {getFluxExample} from 'src/shared/utils/fluxExample'
import {
  isPipeTransformation,
  functionRequiresNewLine,
  InjectionType,
  calcInjectionPosition,
  moveCursorAndTriggerSuggest,
} from 'src/shared/utils/fluxFunctions'

// Types
import {
  FluxToolbarFunction,
  FluxFunction,
  EditorType,
  Variable,
} from 'src/types'

const FluxEditor = lazy(() => import('src/shared/components/FluxMonacoEditor'))

const TimeMachineFluxEditor: FC<{variables: Variable[]}> = props => {
  const dispatch = useDispatch()
  const activeQueryText = useSelector(getActiveQuery).text
  const {activeQueryIndex} = useSelector(getActiveTimeMachine)
  const [editorInstance, setEditorInstance] = useState<EditorType>(null)

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
    if (!editorInstance) {
      return null
    }
    const p = editorInstance.getPosition()
    editorInstance.executeEdits('', [
      {
        range: new monaco.Range(p.lineNumber, p.column, p.lineNumber, p.column),
        text: `v.${variableName}`,
      },
    ])
    handleSetActiveQueryText(editorInstance.getValue())
  }

  const getFluxTextAndRange = func => {
    if (!editorInstance) {
      return null
    }

    const type =
      isPipeTransformation(func) || functionRequiresNewLine(func)
        ? InjectionType.OnOwnLine
        : InjectionType.SameLine

    const {
      row,
      column,
      shouldStartWithNewLine,
      shouldEndInNewLine,
    } = calcInjectionPosition(editorInstance, type)

    let text = isPipeTransformation(func)
      ? `  |> ${func.example.trimRight()}`
      : `${func.example.trimRight()}`

    if (shouldStartWithNewLine) {
      text = `\n${text}`
    }
    if (shouldEndInNewLine) {
      text = `${text}\n`
    }

    const range = new monaco.Range(row, column, row, column)

    return {
      text,
      range,
      injectionPosition: {
        shouldStartWithNewLine,
        shouldEndInNewLine,
        row,
        column,
      },
    }
  }

  const handleInsertFluxFunction = (
    func: FluxToolbarFunction | FluxFunction
  ): void => {
    if (!editorInstance) {
      return
    }

    const funcDefn =
      CLOUD && isFlagEnabled('fluxDynamicDocs')
        ? getFluxExample(func as FluxFunction)
        : func

    const {text, range, injectionPosition} = getFluxTextAndRange(funcDefn)

    const edits = [
      {
        range,
        text,
      },
    ]
    const importStatement = generateImport(
      func.package,
      editorInstance.getValue(),
      func as FluxFunction
    )
    if (importStatement) {
      edits.unshift({
        range: new monaco.Range(1, 1, 1, 1),
        text: `${importStatement}\n`,
      })
    }
    editorInstance.executeEdits('', edits)
    handleSetActiveQueryText(editorInstance.getValue())

    if (isFlagEnabled('fluxDynamicDocs')) {
      moveCursorAndTriggerSuggest(
        editorInstance,
        injectionPosition,
        !!importStatement,
        text.length
      )
    }
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
              setEditorInstance={setEditorInstance}
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
  }, [activeQueryText, editorInstance, activeQueryIndex, props.variables])
}

export {TimeMachineFluxEditor}

export default TimeMachineFluxEditor
