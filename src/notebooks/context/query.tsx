import React, {FC, useContext, useMemo} from 'react'
import {connect} from 'react-redux'
import {AppState, Variable, Organization} from 'src/types'
import {runQuery} from 'src/shared/apis/query'
import {getWindowVars} from 'src/variables/utils/getWindowVars'
import {buildVarsOption} from 'src/variables/utils/buildVarsOption'
import {getTimeRangeVars} from 'src/variables/utils/getTimeRangeVars'
import {getVariables, asAssignment} from 'src/variables/selectors'
import {getOrg} from 'src/organizations/selectors'
import {NotebookContext} from 'src/notebooks/context/notebook.current'
import {TimeContext} from 'src/notebooks/context/time'
import {fromFlux as parse} from '@influxdata/giraffe'
import {event} from 'src/cloud/utils/reporting'
import {FluxResult} from 'src/types/notebooks'
import {PIPE_DEFINITIONS} from 'src/notebooks'

interface Stage {
  text: string
  instances: string[]
}

export interface QueryContextType {
  query: (text: string) => Promise<FluxResult>
  generateMap: () => Stage[]
}

export const DEFAULT_CONTEXT: QueryContextType = {
  query: () => Promise.resolve({} as FluxResult),
  generateMap: () => [],
}

export const QueryContext = React.createContext<QueryContextType>(
  DEFAULT_CONTEXT
)

const PREVIOUS_REGEXP = /__PREVIOUS_RESULT__/g

type Props = StateProps
export const QueryProvider: FC<Props> = ({children, variables, org}) => {
  const {id, notebook} = useContext(NotebookContext)
  const {timeContext} = useContext(TimeContext)
  const time = timeContext[id]

  const vars = useMemo(() => {
    if (time && time.range) {
      return variables
        .map(v => asAssignment(v))
        .concat(getTimeRangeVars(time.range))
    }

    variables.map(v => asAssignment(v))
  }, [variables, time])

  const generateMap = (): Stage[] => {
    return notebook.data.allIDs
      .reduce((stages, pipeID) => {
        const pipe = notebook.data.get(pipeID)

        let stage = {
          text: '',
          instances: [pipeID],
          requirements: {},
        }

        const create = (text, loadPrevious) => {
          if (loadPrevious && stages.length) {
            stage.requirements = {
              ...stages[stages.length - 1].requirements,
              [`prev_${stages.length}`]: stages[stages.length - 1].text,
            }
            stage.text = text.replace(PREVIOUS_REGEXP, `prev_${stages.length}`)
          } else {
            stage.text = text
          }

          stages.push(stage)
        }

        const append = () => {
          if (stages.length) {
            stages[stages.length - 1].instances.push(pipeID)
          }
        }

        if (PIPE_DEFINITIONS[pipe.type].generateFlux) {
          PIPE_DEFINITIONS[pipe.type].generateFlux(pipe, create, append)
        } else {
          append()
        }

        return stages
      }, [])
      .map(queryStruct => {
        const queryText =
          Object.entries(queryStruct.requirements)
            .map(([key, value]) => `${key} = (\n${value}\n)\n\n`)
            .join('') + queryStruct.text

        return {
          text: queryText,
          instances: queryStruct.instances,
        }
      })
  }

  const query = (text: string) => {
    const windowVars = getWindowVars(text, vars)
    const extern = buildVarsOption([...vars, ...windowVars])

    event('runQuery', {context: 'notebooks'})
    return runQuery(org.id, text, extern)
      .promise.then(raw => {
        if (raw.type !== 'SUCCESS') {
          throw new Error(raw.message)
        }

        return raw
      })
      .then(raw => {
        return {
          source: text,
          raw: raw.csv,
          parsed: parse(raw.csv),
          error: null,
        }
      })
  }

  if (!time) {
    return null
  }

  return (
    <QueryContext.Provider value={{query, generateMap}}>
      {children}
    </QueryContext.Provider>
  )
}

interface StateProps {
  variables: Variable[]
  org: Organization
}

const mstp = (state: AppState) => {
  const variables = getVariables(state)
  const org = getOrg(state)

  return {
    org,
    variables,
  }
}

const ConnectedQueryProvider = connect<StateProps>(mstp)(QueryProvider)

export default ConnectedQueryProvider
