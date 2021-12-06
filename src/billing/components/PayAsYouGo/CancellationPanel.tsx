// Libraries
import React, {FC, useState} from 'react'
import {
  Panel,
  ComponentSize,
  ComponentColor,
  Button,
} from '@influxdata/clockface'
import {track} from 'rudder-sdk-js'

// Components
import CancellationOverlay from 'src/billing/components/PayAsYouGo/CancellationOverlay'

// Utils
import {isFlagEnabled} from 'src/shared/utils/featureFlag'
import {useSelector} from 'react-redux'
import {getQuartzMe} from 'src/me/selectors'
import {getOrg} from 'src/organizations/selectors'
import {event} from 'src/cloud/utils/reporting'
import CancelServiceProvider from './CancelServiceContext'

const CancellationPanel: FC = () => {
  const [isOverlayVisible, setIsOverlayVisible] = useState(false)
  const quartzMe = useSelector(getQuartzMe)
  const org = useSelector(getOrg)

  const handleCancelService = () => {
    const payload = {
      org: org.id,
      tier: quartzMe?.accountType,
      email: quartzMe?.email,
    }
    event('CancelServiceInitiation Event', payload)

    if (
      isFlagEnabled('trackCancellations') &&
      isFlagEnabled('rudderstackReporting')
    ) {
      track('CancelServiceInitiation', payload)
    }

    setIsOverlayVisible(true)
  }

  return (
    <>
      <Panel>
        <Panel.Header
          size={ComponentSize.Medium}
          testID="cancel-service--header"
        >
          <h4>Cancel Service</h4>
          <Button
            color={ComponentColor.Default}
            onClick={handleCancelService}
            text="Cancel Service"
            size={ComponentSize.Small}
            testID="cancel-service--button"
          />
        </Panel.Header>
        <Panel.Body size={ComponentSize.Medium}>
          <p>
            You only pay for what you use. To temporarily pause your service,
            just shut off your writes and queries.
          </p>
        </Panel.Body>
      </Panel>
      {isOverlayVisible && (
        <CancelServiceProvider>
          <CancellationOverlay
            onHideOverlay={() => setIsOverlayVisible(false)}
          />
        </CancelServiceProvider>
      )}
    </>
  )
}

export default CancellationPanel
