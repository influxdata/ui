// Libraries
import React, {FC} from 'react'
import {Link} from 'react-router-dom'
import {Button, ComponentSize} from '@influxdata/clockface'
import {useDispatch} from 'react-redux'

// Utils
import {setFunctions} from 'src/timeMachine/actions/queryBuilder'

// Types
import {NotificationDismiss} from 'src/types'

export const getDeleteAccountWarningButton = (
  url: string,
  onDismiss: NotificationDismiss
): JSX.Element => {
  return (
    <Link to={url} onClick={onDismiss} data-testID="go-to-users--link">
      Go to Users page
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
