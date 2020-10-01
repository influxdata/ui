// Libraries
import React, {FC, useContext, useState, useEffect} from 'react'
import {SubmitQueryButton} from 'src/timeMachine/components/SubmitQueryButton'
import QueryProvider, {QueryContext} from 'src/notebooks/context/query'
import {NotebookContext} from 'src/notebooks/context/notebook.current'
import {ResultsContext} from 'src/notebooks/context/results'
import {TimeContext} from 'src/notebooks/context/time'
import {IconFont} from '@influxdata/clockface'
import {notify} from 'src/shared/actions/notifications'

// Utils
import {event} from 'src/cloud/utils/reporting'

// Types
import {RemoteDataState} from 'src/types'

const fakeNotify = notify

export const Submit: FC = () => {
  const {query, generateMap} = useContext(QueryContext)
  const {id, notebook} = useContext(NotebookContext)
  const {add, update} = useContext(ResultsContext)
  const {timeContext} = useContext(TimeContext)
  const [isLoading, setLoading] = useState(RemoteDataState.NotStarted)
  const time = timeContext[id]
  const tr = !!time && time.range

  useEffect(() => {
    submit()
  }, [tr]) // eslint-disable-line react-hooks/exhaustive-deps

  const forceUpdate = (id, data) => {
    try {
      update(id, data)
    } catch (_e) {
      add(id, data)
    }
  }

  const submit = () => {
    event('Notebook Submit Button Clicked')
    setLoading(RemoteDataState.Loading)

    notebook.data.allIDs.forEach(pipeID => {
      notebook.meta.update(pipeID, {loading: RemoteDataState.Loading})
    })

    const map = generateMap()

    Promise.all(
      map.map(stage => {
        return query(stage.text)
          .then(response => {
            stage.instances.forEach(pipeID => {
              forceUpdate(pipeID, response)
              notebook.meta.update(pipeID, {loading: RemoteDataState.Done})
            })
          })
          .catch(e => {
            stage.instances.forEach(pipeID => {
              forceUpdate(pipeID, {
                error: e.message,
              })
              notebook.meta.update(pipeID, {loading: RemoteDataState.Error})
            })
          })
      })
    )
      .then(() => {
        event('Notebook Submit Resolved')

        setLoading(RemoteDataState.Done)
      })
      .catch(e => {
        event('Notebook Submit Resolved')

        // NOTE: this shouldn't fire, but lets wrap it for completeness
        setLoading(RemoteDataState.Error)
        throw e
      })
  }

  const hasQueries = notebook.data.all
    .map(p => p.type)
    .filter(p => p === 'query' || p === 'data' || p === 'queryBuilder').length

  return (
    <SubmitQueryButton
      text="Run Flow"
      className="flows-run-flow"
      icon={IconFont.Play}
      submitButtonDisabled={!hasQueries}
      queryStatus={isLoading}
      onSubmit={submit}
      onNotify={fakeNotify}
    />
  )
}

export default () => (
  <QueryProvider>
    <Submit />
  </QueryProvider>
)
