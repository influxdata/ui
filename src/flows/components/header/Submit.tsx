// Libraries
import React, {FC, MouseEvent, useContext, useState, useEffect} from 'react'
import * as clockface from '@influxdata/clockface'
import {
  Dropdown,
  IconFont,
  ComponentColor,
  ComponentStatus,
  SquareButton,
  Button,
  ButtonGroup,
} from '@influxdata/clockface'
import {SubmitQueryButton} from 'src/timeMachine/components/SubmitQueryButton'
import {QueryContext} from 'src/flows/context/query'
import {FlowContext} from 'src/flows/context/flow.current'
import {ResultsContext} from 'src/flows/context/results'
import {TimeContext} from 'src/flows/context/time'
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
  const [buttonText, setButtonText] = useState('Preview')
  const time = timeContext[id]
  const tr = !!time && time.range

  const hasQueries = flow.data.all
    .map(p => p.type)
    .filter(p => p === 'query' || p === 'data' || p === 'queryBuilder').length

  useEffect(() => {
    if (!hasQueries) {
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
    event('Flow Submit Button Clicked')
    setLoading(RemoteDataState.Loading)

    flow.data.allIDs.forEach(pipeID => {
      flow.meta.update(pipeID, {loading: RemoteDataState.Loading})
    })

    const map = generateMap()

    Promise.all(
      map.map(stage => {
        return query(stage.text)
          .then(response => {
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

  const DropdownButton = (
    active: boolean,
    onClick: (e: MouseEvent<HTMLButtonElement>) => void
  ) => {
    console.log('clockface: ', clockface)
    console.log('clockface.ButtonGroup: ', clockface.ButtonGroup)
    if (!ButtonGroup) {
      return <div />
    }
    console.log('ButtonGroup: ', ButtonGroup)
    return (
      <ButtonGroup>
        <SubmitQueryButton
          text={buttonText}
          className="flows-run-flow"
          icon={IconFont.Stop}
          submitButtonDisabled={!hasQueries}
          queryStatus={isLoading}
          onSubmit={submit}
          onNotify={fakeNotify}
          queryID=""
        />
        <SquareButton
          active={active}
          onClick={onClick}
          icon={IconFont.CaretDown}
          color={ComponentColor.Primary}
        />
      </ButtonGroup>
    )
  }

  const DropdownMenu = (onCollapse: () => void) => (
    <Dropdown.Menu onCollapse={onCollapse}>
      <Dropdown.Item
        value="Preview"
        onClick={setButtonText}
        testID="flow-preview-button"
      >
        Preview
      </Dropdown.Item>
      <Dropdown.Item
        value="Run"
        onClick={setButtonText}
        testID="flow-run-button"
      >
        Run
      </Dropdown.Item>
    </Dropdown.Menu>
  )

  // if (isLoading === RemoteDataState.Loading) {
  //   // TODO(get this to be in the cancel state)
  //   return (
  //     <SubmitQueryButton
  //       text="Cancel"
  //       className="flows-run-flow"
  //       icon={IconFont.Stop}
  //       submitButtonDisabled={false}
  //       queryStatus={isLoading}
  //       onSubmit={submit}
  //       onNotify={fakeNotify}
  //       queryID=""
  //     />
  //   )
  // }

  return (
    <Dropdown
      button={DropdownButton}
      menu={DropdownMenu}
      style={{width: '164px'}}
    />
  )
}

export default Submit
