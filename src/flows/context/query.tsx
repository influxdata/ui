import React, {FC, useContext, useMemo, useEffect} from 'react'
import {useDispatch, useSelector} from 'react-redux'
import {AppState, ResourceType, RemoteDataState} from 'src/types'
import {parse} from 'src/external/parser'
import {runQuery} from 'src/shared/apis/query'
import {getWindowVars} from 'src/variables/utils/getWindowVars'
import {buildVarsOption} from 'src/variables/utils/buildVarsOption'
import {getTimeRangeVars} from 'src/variables/utils/getTimeRangeVars'
import {getVariables, asAssignment} from 'src/variables/selectors'
import {getBuckets} from 'src/buckets/actions/thunks'
import {getSortedBuckets} from 'src/buckets/selectors'
import {getStatus} from 'src/resources/selectors'
import {FlowContext} from 'src/flows/context/flow.current'
import {fromFlux} from '@influxdata/giraffe'
import {event} from 'src/cloud/utils/reporting'
import {FluxResult} from 'src/types/flows'
import {PIPE_DEFINITIONS} from 'src/flows'
import {
  generateHashedQueryID,
  setQueryByHashID,
} from 'src/timeMachine/actions/queries'

interface Stage {
  text: string
  instances: string[]
}

export interface QueryContextType {
  query: (text: string) => Promise<FluxResult>
  generateMap: (withSideEffects?: boolean) => Stage[]
}

export const DEFAULT_CONTEXT: QueryContextType = {
  query: () => Promise.resolve({} as FluxResult),
  generateMap: () => [],
}

export const QueryContext = React.createContext<QueryContextType>(
  DEFAULT_CONTEXT
)

const PREVIOUS_REGEXP = /__PREVIOUS_RESULT__/g

const findOrgID = (text, buckets) => {
  const ast = parse(text)

  const _search = (node, acc = []) => {
    if (!node) {
      return acc
    }
    if (
      node?.type === 'CallExpression' &&
      node?.callee?.type === 'Identifier' &&
      node?.callee?.name === 'from' &&
      node?.arguments[0]?.properties[0]?.key?.name === 'bucket'
    ) {
      acc.push(node)
    }

    Object.values(node).forEach(val => {
      if (Array.isArray(val)) {
        val.forEach(_val => {
          _search(_val, acc)
        })
      } else if (typeof val === 'object') {
        _search(val, acc)
      }
    })

    return acc
  }

  const queryBuckets = _search(ast).map(
    node => node?.arguments[0]?.properties[0]?.value.value
  )

  const bucket = buckets.find(buck => queryBuckets.includes(buck.name))

  return bucket?.orgID
}

export const QueryProvider: FC = ({children}) => {
  const {flow} = useContext(FlowContext)
  const variables = useSelector((state: AppState) => getVariables(state))
  const buckets = useSelector((state: AppState) => getSortedBuckets(state))
  const bucketsLoadingState = useSelector((state: AppState) =>
    getStatus(state, ResourceType.Buckets)
  )

  const dispatch = useDispatch()

  useEffect(() => {
    if (bucketsLoadingState === RemoteDataState.NotStarted) {
      dispatch(getBuckets())
    }
  }, [bucketsLoadingState, dispatch])

  const vars = useMemo(() => {
    if (flow && flow?.range) {
      return variables
        .map(v => asAssignment(v))
        .concat(getTimeRangeVars(flow.range))
    }

    variables.map(v => asAssignment(v))
  }, [variables, flow])

  const generateMap = (withSideEffects?: boolean): Stage[] => {
    return flow.data.allIDs
      .reduce((stages, pipeID) => {
        const pipe = flow.data.get(pipeID)

        const stage = {
          text: '',
          instances: [pipeID],
          requirements: {},
        }

        const create = text => {
          if (text && PREVIOUS_REGEXP.test(text) && stages.length) {
            stage.text = text.replace(
              PREVIOUS_REGEXP,
              stages[stages.length - 1].text
            )
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
          PIPE_DEFINITIONS[pipe.type].generateFlux(
            pipe,
            create,
            append,
            withSideEffects
          )
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
    const orgID = findOrgID(text, buckets)
    const windowVars = getWindowVars(text, vars)
    const extern = buildVarsOption([...vars, ...windowVars])
    const queryID = generateHashedQueryID(text, variables, orgID)

    event('runQuery', {context: 'flows'})
    const result = runQuery(orgID, text, extern)
    setQueryByHashID(queryID, result)
    return result.promise
      .then(raw => {
        if (raw.type !== 'SUCCESS') {
          throw new Error(raw.message)
        }

        return raw
      })
      .then(raw => {
        return {
          source: text,
          raw: raw.csv,
          parsed: fromFlux(raw.csv),
          error: null,
        }
      })
  }

  if (!flow?.range || bucketsLoadingState !== RemoteDataState.Done) {
    return null
  }

  return (
    <QueryContext.Provider value={{query, generateMap}}>
      {children}
    </QueryContext.Provider>
  )
}

export default QueryProvider
