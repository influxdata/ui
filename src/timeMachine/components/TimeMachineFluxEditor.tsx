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

// Actions
import {setActiveQueryText} from 'src/timeMachine/actions'
import {saveAndExecuteQueries} from 'src/timeMachine/actions/queries'

// Utils
import {getActiveQuery, getActiveTimeMachine} from 'src/timeMachine/selectors'
import {
  functionRequiresNewLine,
  generateImport,
} from 'src/timeMachine/utils/insertFunction'
import {event} from 'src/cloud/utils/reporting'
import {CLOUD} from 'src/shared/constants'
import {isFlagEnabled} from 'src/shared/utils/featureFlag'
import {getFluxExample} from 'src/shared/utils/fluxExample'

// Types
import {
  FluxToolbarFunction,
  FluxFunction,
  EditorType,
  MonacoRange,
} from 'src/types'

const FluxEditor = lazy(() => import('src/shared/components/FluxMonacoEditor'))

const TimeMachineFluxEditor: FC = () => {
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

  const getInsertLineNumber = (currentLineNumber: number): number => {
    const scriptLines = activeQueryText.split('\n')

    const currentLine =
      scriptLines[currentLineNumber] || scriptLines[scriptLines.length - 1]

    // Insert on the current line if its an empty line
    if (!currentLine.trim()) {
      return currentLineNumber
    }

    return currentLineNumber + 1
  }

  const defaultColumnPosition = 1 // beginning column of the row

  const getFluxTextAndRange = (func): {text: string; range: MonacoRange} => {
    if (!editorInstance) {
      return null
    }
    const p = editorInstance.getPosition()
    const insertLineNumber = getInsertLineNumber(p.lineNumber)

    let row = insertLineNumber

    const [currentRange] = editorInstance.getVisibleRanges()
    // Determines whether the new insert line is beyond the current range
    let shouldInsertOnNextLine = insertLineNumber > currentRange.endLineNumber
    // edge case for when user toggles to the script editor
    // this defaults the cursor to the initial position (top-left, 1:1 position)
    if (p.lineNumber === 1 && p.column === defaultColumnPosition) {
      // adds the function to the end of the query
      shouldInsertOnNextLine = true
      row = currentRange.endLineNumber + 1
    }

    let text = ''
    if (shouldInsertOnNextLine) {
      text = `\n  |> ${func.example}`
    } else {
      text = `  |> ${func.example}\n`
    }

    if (functionRequiresNewLine(func.name)) {
      text = `\n${func.example}\n`
    }

    const range = new monaco.Range(
      row,
      defaultColumnPosition,
      row,
      defaultColumnPosition
    )

    return {text, range}
  }

  const handleInsertFluxFunction = (
    func: FluxToolbarFunction | FluxFunction
  ): void => {
    if (!editorInstance) {
      return
    }
    const {text, range} = getFluxTextAndRange(
      CLOUD && isFlagEnabled('fluxDynamicDocs')
        ? getFluxExample(func as FluxFunction)
        : func
    )

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
  }, [activeQueryText, editorInstance, activeQueryIndex])
}

export {TimeMachineFluxEditor}

export default TimeMachineFluxEditor
