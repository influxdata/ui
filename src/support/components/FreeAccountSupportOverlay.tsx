import React, {FC, useContext} from 'react'

// Components
import {Overlay, List} from '@influxdata/clockface'

// Contexts
import {OverlayContext} from 'src/overlays/components/OverlayController'

// Components
import CloudUpgradeButton from 'src/shared/components/CloudUpgradeButton'
import {SafeBlankLink} from 'src/utils/SafeBlankLink'

interface OwnProps {
  onClose: () => void
}

const FreeAccountSupportOverlay: FC<OwnProps> = () => {
  const {onClose} = useContext(OverlayContext)

  return (
    <Overlay.Container maxWidth={600}>
      <Overlay.Header
        testID="free-support-overlay-header"
        title="Contact Support"
        onDismiss={onClose}
      />
      <Overlay.Body>
        <p>
          Check our{' '}
          <SafeBlankLink href="https://status.influxdata.com">
            status page
          </SafeBlankLink>{' '}
          to see if there is an outage impacting your region.
        </p>
        <p>
          Contact support is currently only available for Usage-Based Plan and
          Annual customers. Please try our community resources below to recieve
          help or file a feedback & questions form.
        </p>
        <List>
          <List.Item>
            <SafeBlankLink href="https://community.influxdata.com">
              InfluxDB Community Forums
            </SafeBlankLink>
          </List.Item>
          <List.Item>
            <SafeBlankLink href="https://influxcommunity.slack.com/join/shared_invite/zt-156zm7ult-LcIW2T4TwLYeS8rZbCP1mw#/shared-invite/email">
              InfluxDB Slack
            </SafeBlankLink>
          </List.Item>
          <List.Item>
            <SafeBlankLink href="">Feedback & Questions Form</SafeBlankLink>
          </List.Item>
        </List>
      </Overlay.Body>
      <Overlay.Footer className="overlay-footer">
        <CloudUpgradeButton />
      </Overlay.Footer>
    </Overlay.Container>
  )
}

export default FreeAccountSupportOverlay
