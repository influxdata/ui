// Libraries
import React, {FC, useState} from 'react'
import {useHistory} from 'react-router-dom'
import {connect, ConnectedProps} from 'react-redux'

// Components
import {
  Button,
  Overlay,
  Heading,
  FormDivider,
  InfluxColors,
  ComponentSize,
  ComponentColor,
  HeadingElement,
  OverlayContainer,
} from '@influxdata/clockface'
import {SeriesCardinalityIncreaseForm} from './SeriesCardinalityIncreaseForm'

// Utils
import {getOrg} from 'src/organizations/selectors'

// Types
import {AppState} from 'src/types'

interface OwnProps {
  onClose: () => void
}

type ReduxProps = ConnectedProps<typeof connector>

type Props = OwnProps & ReduxProps

const RateLimitOverlay: FC<Props> = ({onClose, orgID}) => {
  const history = useHistory()
  const [showForm, toggleShowForm] = useState<boolean>(false)

  const handleOptimizeClick = (): void => {
    history.push(`/orgs/${orgID}/settings/templates?walkme=19-880913`)
    onClose()
  }

  return (
    <OverlayContainer
      maxWidth={760}
      testID="rate-limit-overlay"
      className="rate-limit-overlay"
    >
      <Overlay.Header
        title={`Let's get your data flowing again.`}
        onDismiss={onClose}
        wrapText={true}
      />
      <Overlay.Body>
        <div className="rate-limit-overlay--content">
          <div className="rate-limit-overlay--image" />
          <div>
            <Heading element={HeadingElement.H4}>
              Install the Series Cardinality Inspector
            </Heading>
            <Button
              size={ComponentSize.Large}
              color={ComponentColor.Success}
              className="rate-alert--install-template-button"
              text="Inspect My Series Cardinality"
              onClick={handleOptimizeClick}
            />
            <p>
              Install not starting?{' '}
              <a
                className="rate-alert--instructions-link"
                href="https://github.com/influxdata/community-templates/tree/master/influxdb2_cardinality_now"
                target="blank"
              >
                See manual instructions
              </a>
              .
            </p>
            <FormDivider lineColor={InfluxColors.Castle} />
            <p>
              Need some guidance?
              <br />
              <a
                href="https://www.influxdata.com/blog/solving-runaway-series-cardinality-when-using-influxdb/"
                target="_blank"
              >
                Solving Runaway Series Cardinality When Using InfluxDB
              </a>
            </p>
            <FormDivider lineColor={InfluxColors.Castle} />
            <p>
              If you’ve inspected your schema and determined that your use-case
              requires a higher series cardinalty limit you may{' '}
              <span
                className="rate-alert--request-increase"
                onClick={() => toggleShowForm(!showForm)}
              >
                submit an increase request
              </span>
              .
            </p>
          </div>
        </div>
        {showForm && <SeriesCardinalityIncreaseForm orgID={orgID} />}
      </Overlay.Body>
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
