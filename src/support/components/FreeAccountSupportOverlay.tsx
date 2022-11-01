// Libraries
import React, {FC, useContext} from 'react'

// Components
import {Icon, IconFont, List, Overlay} from '@influxdata/clockface'
import CloudUpgradeButton from 'src/shared/components/CloudUpgradeButton'

// Contexts
import {OverlayContext} from 'src/overlays/components/OverlayController'

// Utils
import {event} from 'src/cloud/utils/reporting'
import {getDataLayerIdentity} from 'src/cloud/utils/experiments'
import {SafeBlankLink} from 'src/utils/SafeBlankLink'

import './ContactSupport.scss'

interface OwnProps {
  onClose: () => void
}

const FreeAccountSupportOverlay: FC<OwnProps> = () => {
  const {onClose} = useContext(OverlayContext)

  return (
    <Overlay.Container maxWidth={550} testID="overlay--container">
      <Overlay.Header
        testID="free-support-overlay-header"
        title="Contact Support"
        onDismiss={onClose}
      />
      <Overlay.Body>
        <p className="status-page-text">
          <span>
            {' '}
            <Icon glyph={IconFont.Info_New} />{' '}
          </span>
          Check our{' '}
          <SafeBlankLink href="https://status.influxdata.com">
            status page
          </SafeBlankLink>{' '}
          to see if there is an outage impacting your region.
        </p>
        <p>
          Contact support is currently only available for Usage-Based Plan and
          Annual customers. Please try our community resources below to receive
          help or file a feedback & questions form.
        </p>
        <List className="support-links" testID="free-account-links">
          <List.Item>
            <div className="help-logo forum" />
            <SafeBlankLink href="https://community.influxdata.com">
              InfluxDB Community Forums
            </SafeBlankLink>
          </List.Item>
          <List.Item>
            <div className="help-logo slack" />
            <SafeBlankLink href="https://influxcommunity.slack.com/join/shared_invite/zt-156zm7ult-LcIW2T4TwLYeS8rZbCP1mw#/shared-invite/email">
              InfluxDB Slack
            </SafeBlankLink>
          </List.Item>
        </List>
      </Overlay.Body>
      <Overlay.Footer>
        <CloudUpgradeButton
          metric={() => {
            const identity = getDataLayerIdentity()
            event(`help-bar.overlay.free-account.credit-250.upgrade`, {
              location: 'help bar',
              ...identity,
            })
          }}
        />
      </Overlay.Footer>
    </Overlay.Container>
  )
}

export default FreeAccountSupportOverlay
