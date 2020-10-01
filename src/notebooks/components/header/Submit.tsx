// Libraries
import React, {FC, useContext, useState, useEffect} from 'react'
import {SubmitQueryButton} from 'src/timeMachine/components/SubmitQueryButton'
import QueryProvider, {QueryContext} from 'src/notebooks/context/query'
import {NotebookContext} from 'src/notebooks/context/notebook.current'
import {ResultsContext} from 'src/notebooks/context/results'
import {TimeContext} from 'src/notebooks/context/time'
import {IconFont} from '@influxdata/clockface'
import {notify} from 'src/shared/actions/notifications'
import {PIPE_DEFINITIONS} from 'src/notebooks'

// Utils
import {event} from 'src/cloud/utils/reporting'

// Types
import {RemoteDataState} from 'src/types'

const PREVIOUS_REGEXP = /__PREVIOUS_RESULT__/g

const fakeNotify = notify

export const Submit: FC = () => {
  const {query} = useContext(QueryContext)
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

    Promise.all(
      notebook.data.allIDs
        .reduce((stages, pipeID) => {
          notebook.meta.update(pipeID, {loading: RemoteDataState.Loading})
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
              stage.text = text.replace(
                PREVIOUS_REGEXP,
                `prev_${stages.length}`
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

          return query(queryText)
            .then(response => {
              queryStruct.instances.forEach(pipeID => {
                forceUpdate(pipeID, response)
                notebook.meta.update(pipeID, {loading: RemoteDataState.Done})
              })
            })
            .catch(e => {
              queryStruct.instances.forEach(pipeID => {
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
