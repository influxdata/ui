import React, {FC, useContext, useEffect, useState} from 'react'
import {Variable} from 'src/types'
import {TIME_RANGE_START, TIME_RANGE_STOP} from 'src/variables/constants'
import {PipeContext} from 'src/flows/context/pipe'
import {getRangeVariable} from 'src/variables/utils/getTimeRangeVars'
import {getWindowPeriodVariableFromVariables} from 'src/variables/utils/getWindowVars'

const EMPTY_STATE = [] as Variable[]

interface VariablesContextType {
  variables: Variable[]
}

const DEFAULT_CONTEXT: VariablesContextType = {
  variables: [],
}

export const VariablesContext = React.createContext<VariablesContextType>(
  DEFAULT_CONTEXT
)

export const VariablesProvider: FC = ({children}) => {
  const pipe = useContext(PipeContext)
  const [variables, setVariables] = useState(EMPTY_STATE)

  useEffect(() => {
    const timeVars = [
      getRangeVariable(TIME_RANGE_START, pipe.range),
      getRangeVariable(TIME_RANGE_STOP, pipe.range),
    ]

    const {queries, activeQuery} = pipe.data
    const query = queries[activeQuery]
    const windowVar = getWindowPeriodVariableFromVariables(query.text, timeVars)

    setVariables(!!windowVar ? timeVars.concat(windowVar) : timeVars)
  }, [pipe?.id, pipe?.range, pipe?.data.activeQuery])

  return (
    <VariablesContext.Provider value={{variables}}>
      {children}
    </VariablesContext.Provider>
  )
}
