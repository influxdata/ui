// Libraries
import React, {FC, useState} from 'react'
import {
  Panel,
  ComponentSize,
  ComponentColor,
  Button,
} from '@influxdata/clockface'

// Components
import CancellationOverlay from 'src/billing/components/PayAsYouGo/CancellationOverlay'

const CancellationPanel: FC = () => {
  const [isOverlayVisible, setIsOverlayVisible] = useState(false)

  return (
    <>
      <Panel>
        <Panel.Header size={ComponentSize.Medium}>
          <h4>Cancel Service</h4>
          <Button
            color={ComponentColor.Default}
            onClick={() => setIsOverlayVisible(true)}
            text="Cancel Service"
            size={ComponentSize.Small}
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
        <CancellationOverlay onHideOverlay={() => setIsOverlayVisible(false)} />
      )}
    </>
  )
}

export default CancellationPanel
