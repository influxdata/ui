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
import 'src/writeData/subscriptions/components/SubscriptionDetails.scss'
import {event} from 'src/cloud/utils/reporting'
import CodeSnippet from 'src/shared/components/CodeSnippet'

interface Props {
  bulletins: string[]
  handleClose: () => void
}

const SubscriptionErrorsOverlay: FC<Props> = ({bulletins, handleClose}) => {
  const handleDismiss = () => {
    const payload = {}
    event('Subscription Errors Overlay Dismissed Event', payload)
    handleClose()
  }

  // TODO: Remove This
  // NOTE: Errors Found in X Bulletins
  // Does Bulletin term make sense?
  let title = `${bulletins.length} Errors Found`
  if (bulletins.length === 1) {
    title = `1 Error Found`
  }

  return (
    <Overlay visible={true} className="cancellation-overlay">
      <Overlay.Container maxWidth={700}>
        <Overlay.Header title={title} onDismiss={handleDismiss} />
        <Overlay.Body>
          <DapperScrollbars autoSizeHeight={true} style={{maxHeight: '500px'}}>
            <CodeSnippet
              showCopyControl={false}
              text={`${bulletins.join('\n\n')}`}
            ></CodeSnippet>
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
