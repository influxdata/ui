import React, {FC, useContext, useEffect, useState} from 'react'
import {Variable} from 'src/types'
import {FlowQueryContext} from 'src/flows/context/flow.query'
import {FlowContext} from 'src/flows/context/flow.current'
import {PipeContext} from 'src/flows/context/pipe'
import {getRangeVariable} from 'src/variables/utils/getTimeRangeVars'
import {TIME_RANGE_START, TIME_RANGE_STOP} from 'src/variables/constants'
import {getWindowPeriodVariableFromVariables} from 'src/variables/utils/getWindowVars'

const EMPTY_STATE = [] as Variable[]

interface VariablesContextType {
  variables: Variable[]
}

const DEFAULT_CONTEXT: VariablesContextType = {
  variables: [],
}

export const VariablesContext =
  React.createContext<VariablesContextType>(DEFAULT_CONTEXT)

export const VariablesProvider: FC = ({children}) => {
  const {id, range: pipeRange} = useContext(PipeContext)
  const {flow} = useContext(FlowContext)
  const {getPanelQueries} = useContext(FlowQueryContext)
  const {source} = getPanelQueries(id)
  const [variables, setVariables] = useState(EMPTY_STATE)

  useEffect(() => {
    if ((!pipeRange && !flow?.range) || !source) {
      return
    }
    const range = pipeRange || flow?.range
    const timeVars = [
      getRangeVariable(TIME_RANGE_START, range),
      getRangeVariable(TIME_RANGE_STOP, range),
    ]
    const windowVar = getWindowPeriodVariableFromVariables(source, timeVars)
    setVariables(!!windowVar ? timeVars.concat(windowVar) : timeVars)
  }, [id, source, pipeRange, flow?.range])

  return (
    <VariablesContext.Provider value={{variables}}>
      {children}
    </VariablesContext.Provider>
  )
}
