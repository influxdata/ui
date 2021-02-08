// Libraries
import React, {FC, useContext} from 'react'

// Components
import {Button, ComponentSize, IconFont} from '@influxdata/clockface'

// Contexts
import {PipeContext} from 'src/flows/context/pipe'

// Constants
import {FUNCTIONS, QueryFn} from 'src/timeMachine/constants/queryBuilder'

// Utils
import {event} from 'src/cloud/utils/reporting'

interface Props {
  error: string
}

const FriendlyQueryError: FC<Props> = ({error}) => {
  const {data, update} = useContext(PipeContext)
  const selectedFunction = data?.aggregateFunction || FUNCTIONS[0]
  // NOTE: Using string matching for errors because flux doesn't
  // return error codes yet
  const isAggTypeError = error.includes('unsupported aggregate')
  const isStringType = error.includes('type string')

  const updateSelectedFunction = (aggregateFunction: QueryFn) => () => {
    event(`Updating the Aggregate function in the Flow Query Builder`, {
      function: aggregateFunction.name,
    })
    update({aggregateFunction})
  }

  if (!isAggTypeError) {
    return <div className="panel-resizer--error">{error}</div>
  }

  let type = 'integers'
  let suggestedFunc = FUNCTIONS.find(func => func.name === 'mean')

  if (isStringType) {
    type = 'strings'
    suggestedFunc = FUNCTIONS.find(func => func.name === 'last')
  }

  const friendlyError = `${selectedFunction.name} cannot be applied to ${type}, try selecting ${suggestedFunc.name}`

  return (
    <div className="panel-resizer--error">
      {friendlyError}
      <Button
        icon={IconFont.FunnelSolid}
        size={ComponentSize.ExtraSmall}
        text={`Switch to ${suggestedFunc.name}`}
        onClick={updateSelectedFunction(suggestedFunc)}
        className="panel-resizer--error-button"
      />
    </div>
  )
}

export default FriendlyQueryError
