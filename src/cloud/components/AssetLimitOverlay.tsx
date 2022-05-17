// Libraries
import React, {FC} from 'react'
import {connect} from 'react-redux'
import {get} from 'lodash'

// Components
import {
  OverlayContainer,
  Overlay,
  ComponentSize,
  GradientBox,
  Gradients,
  InfluxColors,
} from '@influxdata/clockface'
import CloudUpgradeButton from 'src/shared/components/CloudUpgradeButton'

// Utils
import {isFlagEnabled} from 'src/shared/utils/featureFlag'
import {getExperimentVariantId} from 'src/cloud/utils/experiments'

// Constants
import {CREDIT_250_EXPERIMENT_ID} from 'src/shared/constants'

// Types
import {AppState} from 'src/types'
import {event} from 'src/cloud/utils/reporting'

interface OwnProps {
  onClose: () => void
}

interface StateProps {
  assetName: string
}

const AssetLimitOverlay: FC<OwnProps & StateProps> = ({assetName, onClose}) => {
  return (
    <OverlayContainer
      maxWidth={600}
      testID="asset-limit-overlay"
      className="asset-limit-overlay"
    >
      <GradientBox
        borderGradient={Gradients.MiyazakiSky}
        borderColor={InfluxColors.Grey5}
      >
        <div className="asset-limit-overlay--contents">
          <Overlay.Header
            title={`Need More ${assetName}?`}
            wrapText={true}
            onDismiss={onClose}
          />
          <Overlay.Body>
            <div className="asset-limit-overlay--graphic-container">
              <div className="asset-limit-overlay--graphic">
                <div className="asset-limit-overlay--graphic-element" />
              </div>
            </div>
            <p>
              You’ve reached the maximum allotted {assetName} on your current
              plan. Upgrade to Pay as you go to create more {assetName}.
            </p>
          </Overlay.Body>
          <Overlay.Footer>
            <CloudUpgradeButton
              size={ComponentSize.Large}
              className="upgrade-payg--button__asset-create"
              metric={() => {
                event(
                  isFlagEnabled('credit250Experiment') &&
                    getExperimentVariantId(CREDIT_250_EXPERIMENT_ID) === '1'
                    ? 'credit-250 asset limit overlay upgrade'
                    : 'asset limit overlay upgrade',
                  {asset: assetName}
                )
              }}
            />
          </Overlay.Footer>
        </div>
      </GradientBox>
    </OverlayContainer>
  )
}

const mstp = (state: AppState) => {
  return {
    assetName: get(state, 'overlays.params.asset', ''),
  }
}

export default connect(mstp)(AssetLimitOverlay)
