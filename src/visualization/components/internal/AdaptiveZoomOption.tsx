// Libraries
import React, {FC} from 'react'

// Components
import {
  AlignItems,
  ComponentSize,
  FlexBox,
  FlexDirection,
  InputLabel,
  QuestionMarkTooltip,
  SlideToggle,
} from '@influxdata/clockface'
import {SafeBlankLink} from 'src/utils/SafeBlankLink'

// Metrics
import {event} from 'src/cloud/utils/reporting'

interface AdaptiveZoomToggleProps {
  adaptiveZoomHide: boolean
  update: (obj: any) => void
  testID?: string
  type: string
}

const adaptiveZoomTooltipStyle = {
  maxWidth: '40%',
  padding: '2px 18px',
}

const adaptiveZoomContainerStyle = {
  marginBottom: '16px',
}

const adaptiveZoomTooltip = (
  <div>
    <p>
      When enabled, will re-query on the selected domain upon zooming in on the
      graph. The window period will be the auto or custom window period
      selected.
    </p>
    <p>
      <SafeBlankLink href="https://docs.influxdata.com/influxdb/cloud/visualize-data/variables/#vwindowperiod">
        Learn about window period
      </SafeBlankLink>
    </p>
  </div>
)

export const AdaptiveZoomToggle: FC<AdaptiveZoomToggleProps> = ({
  adaptiveZoomHide,
  update,
  type,
}) => {
  const handleSetAdaptiveZoom = () => {
    update({
      adaptiveZoomHide: !adaptiveZoomHide,
    })
    event(`visualization.customize.adaptiveZoom.${!adaptiveZoomHide}`, {
      type,
    })
  }

  return (
    <FlexBox
      direction={FlexDirection.Row}
      alignItems={AlignItems.Center}
      margin={ComponentSize.Medium}
      stretchToFitWidth={true}
      className="adaptive-zoom-toggle"
      testID="adaptive-zoom-toggle"
      style={adaptiveZoomContainerStyle}
    >
      <SlideToggle
        active={!adaptiveZoomHide}
        size={ComponentSize.ExtraSmall}
        onChange={handleSetAdaptiveZoom}
      />
      <InputLabel>Adaptive Zoom</InputLabel>
      <QuestionMarkTooltip
        diameter={16}
        tooltipContents={adaptiveZoomTooltip}
        tooltipStyle={adaptiveZoomTooltipStyle}
      />
    </FlexBox>
  )
}
