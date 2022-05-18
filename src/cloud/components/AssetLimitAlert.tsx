// Libraries
import React, {FC} from 'react'

// Components
import {
  FlexBox,
  JustifyContent,
  Gradients,
  InfluxColors,
  GradientBox,
  Panel,
  Heading,
  HeadingElement,
  AlignItems,
} from '@influxdata/clockface'
import CloudUpgradeButton from 'src/shared/components/CloudUpgradeButton'

// Utils
import {event} from 'src/cloud/utils/reporting'
import {isFlagEnabled} from 'src/shared/utils/featureFlag'
import {
  getDataLayerIdentity,
  getExperimentVariantId,
} from 'src/cloud/utils/experiments'

// Constants
import {CLOUD} from 'src/shared/constants'
import {CREDIT_250_EXPERIMENT_ID} from 'src/shared/constants'

// Types
import {LimitStatus} from 'src/cloud/actions/limits'

interface Props {
  limitStatus: LimitStatus['status']
  resourceName: string
  className?: string
}

const AssetLimitAlert: FC<Props> = ({limitStatus, resourceName, className}) => {
  if (CLOUD && limitStatus === 'exceeded') {
    return (
      <GradientBox
        borderGradient={Gradients.MiyazakiSky}
        borderColor={InfluxColors.Grey5}
        className={className}
      >
        <Panel backgroundColor={InfluxColors.Grey5} className="asset-alert">
          <Panel.Header>
            <Heading element={HeadingElement.H4}>
              Need more {resourceName}?
            </Heading>
          </Panel.Header>
          <Panel.Body className="asset-alert--contents">
            <FlexBox
              justifyContent={JustifyContent.FlexEnd}
              alignItems={AlignItems.FlexEnd}
              stretchToFitHeight={true}
            >
              <CloudUpgradeButton
                buttonText={`Get more ${resourceName}`}
                className="upgrade-payg--button__asset-alert"
                metric={() => {
                  const experimentVariantId = getExperimentVariantId(
                    CREDIT_250_EXPERIMENT_ID
                  )
                  const identity = getDataLayerIdentity()
                  event(
                    isFlagEnabled('credit250Experiment') &&
                      experimentVariantId === '1'
                      ? `${resourceName}.alert.limit.credit-250.upgrade`
                      : `${resourceName}.alert.limit.upgrade`,
                    {
                      asset: resourceName,
                      ...identity,
                      experimentId: CREDIT_250_EXPERIMENT_ID,
                      experimentVariantId,
                    }
                  )
                }}
              />
            </FlexBox>
          </Panel.Body>
        </Panel>
      </GradientBox>
    )
  }

  return null
}

export default AssetLimitAlert
