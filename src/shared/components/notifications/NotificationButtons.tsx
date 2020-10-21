// Libraries
import React, {FC} from 'react'
import {Link} from 'react-router-dom'
import {Button, ComponentSize} from '@influxdata/clockface'
import {useDispatch, useSelector} from 'react-redux'

// Utils
import {setFunctions} from 'src/timeMachine/actions/queryBuilder'

// Selectors
import {getOrg} from 'src/organizations/selectors'

export const getDemoDataSuccessButton = (url: string): JSX.Element => {
  return (
    <Link to={url} className="cf-button cf-button-xs cf-button-default">
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

export const DemoDataErrorButton: FC = () => {
  const org = useSelector(getOrg)
  const {id} = org

  return (
    <Link
      to={`/orgs/${id}/load-data/buckets`}
      className="cf-button cf-button-xs cf-button-default"
    >
      <span className="cf-button--label">Go to buckets</span>
    </Link>
  )
}

export const getDemoDataErrorButton = (): JSX.Element => {
  return <DemoDataErrorButton />
}
