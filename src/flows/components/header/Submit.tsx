// Libraries
import React, {FC, useContext, useMemo, useState, useEffect} from 'react'
import {SubmitQueryButton} from 'src/timeMachine/components/SubmitQueryButton'
import {QueryContext} from 'src/flows/context/query'
import {FlowContext} from 'src/flows/context/flow.current'
import {ResultsContext} from 'src/flows/context/results'
import {TimeContext} from 'src/flows/context/time'
import {IconFont} from '@influxdata/clockface'
import {notify} from 'src/shared/actions/notifications'

// Utils
import {event} from 'src/cloud/utils/reporting'

// Types
import {RemoteDataState} from 'src/types'

const fakeNotify = notify

export const Submit: FC = () => {
  const {query, generateMap} = useContext(QueryContext)
  const {id, flow} = useContext(FlowContext)
  const {add, update} = useContext(ResultsContext)
  const {timeContext} = useContext(TimeContext)
  const [isLoading, setLoading] = useState(RemoteDataState.NotStarted)
  const time = timeContext[id]
  const tr = !!time && time.range

  const hasQueries = useMemo(() => {
    return flow.data.all
      .map(p => p.type)
      .filter(p => p === 'query' || p === 'queryBuilder').length
  }, [flow.data])

  useEffect(() => {
    if (hasQueries) {
      submit()
    }
  }, [tr, hasQueries]) // eslint-disable-line react-hooks/exhaustive-deps

  const forceUpdate = (id, data) => {
    try {
      update(id, data)
    } catch (_e) {
      add(id, data)
    }
  }

  const submit = () => {
    const map = generateMap()

    if (!map.length) {
      return
    }

    event('Flow Submit Button Clicked')
    setLoading(RemoteDataState.Loading)

    flow.data.allIDs.forEach(pipeID => {
      flow.meta.update(pipeID, {loading: RemoteDataState.Loading})
    })

    Promise.all(
      map.map(stage => {
        return query(stage.text)
          .then(response => {
            console.log(stage)
            stage.instances.forEach(pipeID => {
              forceUpdate(pipeID, response)
              flow.meta.update(pipeID, {loading: RemoteDataState.Done})
            })
          })
          .catch(e => {
            stage.instances.forEach(pipeID => {
              forceUpdate(pipeID, {
                error: e.message,
              })
              flow.meta.update(pipeID, {loading: RemoteDataState.Error})
            })
          })
      })
    )
      .then(() => {
        event('Flow Submit Resolved')

        setLoading(RemoteDataState.Done)
      })
      .catch(e => {
        event('Flow Submit Resolved')

        // NOTE: this shouldn't fire, but lets wrap it for completeness
        setLoading(RemoteDataState.Error)
        throw e
      })
  }

  return (
    <SubmitQueryButton
      text="Run Flow"
      className="flows-run-flow"
      icon={IconFont.Play}
      submitButtonDisabled={!hasQueries}
      queryStatus={isLoading}
      onSubmit={submit}
      onNotify={fakeNotify}
      queryID=""
    />
  )
}

export default Submit
