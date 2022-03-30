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
import {isFlagEnabled} from 'src/shared/utils/featureFlag'

// Types
import {FluxToolbarFunction, EditorType} from 'src/types'
import * as monacoEditor from 'monaco-editor/esm/vs/editor/editor.api'


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
        range: new window.monaco.Range(
          p.lineNumber,
          p.column,
          p.lineNumber,
          p.column
        ),
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

  const getFluxTextAndRange = (
    func
  ): {text: string; range: monacoEditor.Range} => {
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

    const range = new window.monaco.Range(
      row,
      defaultColumnPosition,
      row,
      defaultColumnPosition
    )

    return {text, range}
  }

  // dynamic flux example parser function
  const getFluxExample = func => {
    const {name, fluxType} = func

    let signature

    // get copy of fluxtype signature before arrow sign
    // look into using string.split() instead
    const index = fluxType.lastIndexOf('=')
    const fluxsign = fluxType.slice(0, index)

    // param before arrow  (<-arr:[A], fn:(x:A) => bool) 

    // access parameters alone inside function signature
    const firstIndex = fluxsign.indexOf('(')
    const secondIndex = fluxsign.lastIndexOf(')')
    const parametersAsOneSentence = fluxsign
      .substring(firstIndex + 1, secondIndex)
      .replace(/\s/g, '')
    
    
    console.log('available params ', parametersAsOneSentence)
    //available params  <-arr:[A],fn:(x:A)=>bool

    // sparate each parameter

    const individualParams = []
    const stack = [] // [ 
    const brackets = {
        '(': ')',
        '[': ']',
        '{': '}'
      }
    let param = ''
    //<-tables:stream[A],every:duration,?groupColumns:[string],?unit:duration
    // default:A,dict:[B:A],key:B
    for (let i = 0; i < parametersAsOneSentence.length; i++) {
      if (parametersAsOneSentence[i] === ',' && !stack.length) { // case: params with no brackets in them
        if (!param.startsWith('?') && !param.startsWith('<')) { // dont add to array if param is optional
          individualParams.push(param)
          param = ''
          i++
        }
      }
      param += parametersAsOneSentence[i] 

      if (brackets.hasOwnProperty(parametersAsOneSentence[i]) ) { // its opening bracket 
        stack.push(parametersAsOneSentence[i])
      } 
      if (Object.values(brackets).includes(parametersAsOneSentence[i])) { // its closing bracket 
        const closing = stack.pop()
        // if its a closing bracket and stack is empty and the next element is a comma, its a complete parameter. 
        if (parametersAsOneSentence[i] === brackets[closing] && !stack.length && parametersAsOneSentence[i + 1] === ',') { 
          if (!param.startsWith('?') && !param.startsWith('<')) { // dont add to array if param is optional
            individualParams.push(param)
            param = ''
            i++
          } else { // it's optional param. set params to empty
            param = ''
            i++
          }
        }
      }
      if (i === parametersAsOneSentence.length - 1) { // end of iteration
        if (!param.startsWith('?') && !param.startsWith('<')) { // dont add to array if param is optional
          individualParams.push(param)
        }
      }
    }

  // remove optional parameters 

    individualParams.map((element, index) => {
     
      if (element.startsWith('pairs')) {
        individualParams[index] =
          'pairs: [{key: 1, value: "foo"},{key: 2, value: "bar"}]'
        return
      }
      if (element.startsWith('dict')) {
        individualParams[index] = 'dict: [1: "foo", 2: "bar"]' // default:A,dict:[B:A],key:B
      }
      if (element.startsWith('key')) {
        individualParams[index] = 'key: 1'
      }
      if (element.startsWith('default')) {
        individualParams[index] = 'default: ""'
      }

    })

    console.log('params array after parse', individualParams)

    signature = `${func.package}.${name}` + `(` + individualParams.join(', ') + `)`

    // add example property to flux function object
    return {...func, example: signature}

  }

  const handleInsertFluxFunction = (func: FluxToolbarFunction): void => {
    if (!editorInstance) {
      return
    }
    const {text, range} = getFluxTextAndRange( isFlagEnabled('fluxDynamicDocs') ? getFluxExample(func) : func)

    const edits = [
      {
        range,
        text,
      },
    ]
    const importStatement = generateImport(
      func.package,
      editorInstance.getValue()
    )
    if (importStatement) {
      edits.unshift({
        range: new window.monaco.Range(1, 1, 1, 1),
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
