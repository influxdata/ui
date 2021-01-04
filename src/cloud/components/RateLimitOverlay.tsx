// Libraries
import React, {FC, useState} from 'react'
import {Link, RouteComponentProps} from 'react-router-dom'
import {connect, ConnectedProps} from 'react-redux'

// Components
import {
  Button,
  FlexBox,
  Overlay,
  Heading,
  LinkButton,
  ButtonShape,
  FlexDirection,
  ComponentSize,
  ComponentColor,
  JustifyContent,
  HeadingElement,
  OverlayContainer,
  AlignItems,
} from '@influxdata/clockface'
import CodeSnippet from 'src/shared/components/CodeSnippet'

// Utils
import {
  copyToClipboardSuccess,
  copyToClipboardFailed,
} from 'src/shared/copy/notifications'
import {getOrg} from 'src/organizations/selectors'

// Types
import {AppState} from 'src/types'


interface OwnProps {
  onClose: () => void
}

type ReduxProps = ConnectedProps<typeof connector>

type Props = OwnProps & ReduxProps & RouteComponentProps

const RateLimitOverlay: FC<Props> = ({onClose, orgID, history}) => {
  const [showManualInstructions, toggleShowManualInstructions] = useState<Boolean>(false)

  const handleOptimizeClick = () => {
    history.push(`/orgs/${orgID}/settings/templates?walkme=19-880913`)
  }

  const handleClickManual = e => {
    e.preventDefault()
    toggleShowManualInstructions(true)
  }

  const copyToClipboard = () => (copySucceeded) => {
    if (copySucceeded) {
      return copyToClipboardSuccess('InfluxDB 2 Operational Monitoring Template')
    } else {
      return copyToClipboardFailed('InfluxDB 2 Operational Monitoring Template')
    }
  }

  return (
    <OverlayContainer
      maxWidth={600}
      testID="rate-limit-overlay"
      className="rate-limit-overlay"
    >
        <div className="rate-limit-overlay--contents">
          <Overlay.Header
            title={`Let's get your data flowing again.`}
            onDismiss={onClose}
          />
          <Overlay.Body>
            <Heading element={HeadingElement.H4}>Tips &amp; Best Practices</Heading>
            <p> <a href="https://www.influxdata.com/blog/solving-runaway-series-cardinality-when-using-influxdb/" target="_blank">Solving Runaway Series Cardinality When Using InfluxDB</a></p>
            <p> <a href="https://docs.influxdata.com/influxdb/v2.0/write-data/best-practices/" target="_blank">Best Practices for Writing Data</a></p>
            <br />
            <Heading element={HeadingElement.H4}>Guided Schema Optimization</Heading>
            <p>
              <FlexBox
                direction={FlexDirection.Column}
                margin={ComponentSize.Medium}
                alignItems={AlignItems.Center}
                stretchToFitWidth={true}
              >
                <Button
                  size={ComponentSize.Large}
                  color={ComponentColor.Success}
                  className="rate-limit--guide-button"
                  text="Start Optimizing My Schema"
                  onClick={handleOptimizeClick}
                />
              </FlexBox>
            </p>
            <p>
              Guide not starting?{' '}
              <a href="" onClick={handleClickManual}>
                See manual instructions
              </a>
              .
            </p>
            {showManualInstructions && (
              <>
                <br />
                <Heading element={HeadingElement.H4}>Install InfluxDB2 Operation Monitoring Template</Heading>
                <p>Copy this template URL to install the template manually.</p>
                <CodeSnippet
                  copyText="https://raw.githubusercontent.com/influxdata/community-templates/master/influxdb2_operational_monitoring/influxdb2_operational_monitoring.yml"
                  label="InfluxDB 2 Operational Monitoring Template"
                  onCopyText={copyToClipboard()}
                />
                <Link to={`/orgs/${orgID}/settings/templates`}>
                  <Button
                    text="Install Template"
                  />
                </Link>
              </>
            )}
          </Overlay.Body>
          <Overlay.Footer>
          <FlexBox
            direction={FlexDirection.Column}
            margin={ComponentSize.Small}
            justifyContent={JustifyContent.Center}
            stretchToFitWidth={true}
          >
              <p>Need a bit more guidance?</p>
              <LinkButton
                className="rate-alert--contact-button"
                color={ComponentColor.Primary}
                size={ComponentSize.Small}
                shape={ButtonShape.Default}
                text="Speak with an Expert"
                href="https://calendly.com/c/CBCTLOTDNVLFUTZO"
                target="_blank"
              />
           </FlexBox>
          </Overlay.Footer>
        </div>
    </OverlayContainer>
  )
}

const mstp = (state: AppState) => {
  const {id} = getOrg(state)

  return {
    orgID: id,
  }
}

const connector = connect(mstp)

export default connector(RateLimitOverlay)