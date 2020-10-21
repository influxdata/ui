// Libraries
import React, {FC} from 'react'
import {Link} from 'react-router-dom'
import {Button, ComponentSize} from '@influxdata/clockface'
import {useDispatch} from 'react-redux'

// Utils
import {setFunctions} from 'src/timeMachine/actions/queryBuilder'

export const getDemoDataSuccessButton = (url: string): JSX.Element => {
  return (
    <Link to={url} className="cf-button cf-button-sm cf-button-default">
      <span className="cf-button--label">Go to dashboard</span>
    </Link>
  )
}

export const AggregateTypeErrorButton: FC = () => {
  const dispatch = useDispatch()
  const onClick = () => {
    dispatch(setFunctions(['last']))
  }

  return (
    <Button
      text="Update Aggregate Type"
      onClick={onClick}
      size={ComponentSize.ExtraSmall}
    />
  )
}

export const getAggregateTypeErrorButton = (): JSX.Element => {
  return <AggregateTypeErrorButton />
}
