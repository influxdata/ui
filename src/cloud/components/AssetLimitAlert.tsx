// Libraries
import React, {CSSProperties, FC} from 'react'
import {useSelector} from 'react-redux'

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
import {CloudUpgradeButton} from 'src/shared/components/CloudUpgradeButton'

// Utils
import {event} from 'src/cloud/utils/reporting'

// Selectors
import {shouldGetCredit250Experience} from 'src/me/selectors'

// Constants
import {CLOUD} from 'src/shared/constants'

// Types
import {LimitStatus} from 'src/cloud/actions/limits'

interface Props {
  limitStatus: LimitStatus['status']
  resourceName: string
  className?: string
  style?: CSSProperties
}

export const AssetLimitAlert: FC<Props> = ({
  limitStatus,
  resourceName,
  className,
  style = {},
}) => {
  const isCredit250ExperienceActive = useSelector(shouldGetCredit250Experience)

  if (CLOUD && limitStatus === 'exceeded') {
    return (
      <GradientBox
        borderGradient={Gradients.MiyazakiSky}
        borderColor={InfluxColors.Grey5}
        className={className}
        style={{...style}}
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
                  event(
                    isCredit250ExperienceActive
                      ? `${resourceName}.alert.limit.credit-250.upgrade`
                      : `${resourceName}.alert.limit.upgrade`,
                    {asset: resourceName}
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
