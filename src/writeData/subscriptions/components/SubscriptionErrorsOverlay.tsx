// Libraries
import React, {FC} from 'react'

// Components
import {
  Button,
  ComponentColor,
  DapperScrollbars,
  Overlay,
} from '@influxdata/clockface'

// Utils

// Types

// Styles
import 'src/writeData/subscriptions/components/SubscriptionErrorsOverlay.scss'
import {event} from 'src/cloud/utils/reporting'
import {Bulletin} from 'src/writeData/subscriptions/context/subscription.list'

interface Props {
  bulletins: Bulletin[]
  handleClose: () => void
}

const SubscriptionErrorsOverlay: FC<Props> = ({bulletins, handleClose}) => {
  const handleDismiss = () => {
    const payload = {}
    event('Subscription Errors Overlay Dismissed Event', payload)
    handleClose()
  }

  let title = `${bulletins.length} Notifications Found`
  if (bulletins.length === 1) {
    title = `1 Notifications Found`
  }

  return (
    <Overlay visible={true} className="subscription-errors-overlay">
      <Overlay.Container maxWidth={800}>
        <Overlay.Header title={title} onDismiss={handleDismiss} />
        <Overlay.Body>
          <DapperScrollbars
            autoSizeHeight={true}
            className="subscription-error-scrollbars"
          >
            <div className="subscription-errors-overlay-body">
              <div className="status-header">
                <div className="timestamp">Last Seen(UTC)</div>
                <div className="message">Message</div>
              </div>
              {bulletins.map((bulletin: Bulletin, i) => {
                return (
                  <div className="status-row" key={`SubBulletin${i}`}>
                    <div className="timestamp">
                      {new Date(bulletin.timestamp).toISOString()}
                    </div>
                    <div className="message">{bulletin.message}</div>
                  </div>
                )
              })}
            </div>
          </DapperScrollbars>
        </Overlay.Body>
        <Overlay.Footer>
          <Button
            color={ComponentColor.Primary}
            text="Close"
            onClick={handleDismiss}
            testID="subs-errors-cancel-btn"
          />
        </Overlay.Footer>
      </Overlay.Container>
    </Overlay>
  )
}

export default SubscriptionErrorsOverlay
