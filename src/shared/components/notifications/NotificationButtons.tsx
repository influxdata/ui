// Libraries
import React, {FC} from 'react'
import {Link} from 'react-router-dom'
import {Button, ComponentSize} from '@influxdata/clockface'
import {useDispatch, useSelector} from 'react-redux'

// Utils
import {setFunctions} from 'src/timeMachine/actions/queryBuilder'

// Types
import {NotificationDismiss} from 'src/types'

// Selectors
import {getOrg} from 'src/organizations/selectors'

export const getDemoDataSuccessButton = (
  url: string,
  onDismiss: NotificationDismiss
): JSX.Element => {
  return (
    <Link
      to={url}
      className="cf-button cf-button-xs cf-button-default"
      onClick={onDismiss}
    >
      <span className="cf-button--label">Go to dashboard</span>
    </Link>
  )
}

interface AggregateTypeErrorButtonProps {
  onDismiss: NotificationDismiss
}

export const AggregateTypeErrorButton: FC<AggregateTypeErrorButtonProps> = ({
  onDismiss,
}) => {
  const dispatch = useDispatch()
  const onClick = () => {
    dispatch(setFunctions(['last']))
    onDismiss()
  }

  return (
    <Button
      text="Update Aggregate Type"
      onClick={onClick}
      size={ComponentSize.ExtraSmall}
    />
  )
}

export const getAggregateTypeErrorButton = (
  onDismiss: NotificationDismiss
): JSX.Element => {
  return <AggregateTypeErrorButton onDismiss={onDismiss} />
}

interface DemoDataErrorButtonProps {
  onDismiss: NotificationDismiss
}

export const DemoDataErrorButton: FC<DemoDataErrorButtonProps> = ({
  onDismiss,
}) => {
  const org = useSelector(getOrg)
  const {id} = org

  return (
    <Link
      onClick={onDismiss}
      to={`/orgs/${id}/load-data/buckets`}
      className="cf-button cf-button-xs cf-button-default"
    >
      <span className="cf-button--label">Go to buckets</span>
    </Link>
  )
}

export const getDemoDataErrorButton = (
  onDismiss: NotificationDismiss
): JSX.Element => {
  return <DemoDataErrorButton onDismiss={onDismiss} />
}
