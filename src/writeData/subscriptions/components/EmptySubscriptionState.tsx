// Libraries
import React, {FC} from 'react'
import {useHistory} from 'react-router-dom'
import {useSelector} from 'react-redux'

// Types
import {ORGS, SUBSCRIPTIONS} from 'src/shared/constants/routes'

// Utils
import {getOrg} from 'src/organizations/selectors'

// Components
import {
  Button,
  IconFont,
  ComponentSize,
  EmptyState,
  ComponentColor,
  ComponentStatus,
} from '@influxdata/clockface'

const EmptySubscriptionState: FC = () => {
  const org = useSelector(getOrg)
  const history = useHistory()
  return (
    <EmptyState size={ComponentSize.Medium} testID="subscriptions-empty-state">
      <EmptyState.Text>
        Collect data from an external cloud source with a{' '}
        <b>Native Subscription</b>.
      </EmptyState.Text>
      <Button
        text="Create Subscription"
        icon={IconFont.Plus_New}
        color={ComponentColor.Primary}
        onClick={() => {
          history.push(`/${ORGS}/${org.id}/load-data/${SUBSCRIPTIONS}/create`)
        }}
        status={ComponentStatus.Default}
        titleText=""
        testID="create-subscription-button--empty"
      />
    </EmptyState>
  )
}

export default EmptySubscriptionState
