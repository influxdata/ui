// Libraries
import React, {CSSProperties, FC} from 'react'

// Components
import {
  AlignItems,
  ComponentSize,
  FlexBox,
  FlexDirection,
  InfluxColors,
  InputLabel,
  QuestionMarkTooltip,
  SlideToggle,
} from '@influxdata/clockface'

// Metrics
import {event} from 'src/cloud/utils/reporting'

interface AdaptiveZoomToggleProps {
  adaptiveZoomHide: boolean
  update: (obj: any) => void
  testID?: string
  type: string
}

const getToggleColor = (toggle: boolean): CSSProperties => {
  if (toggle) {
    return {color: InfluxColors.Grey95}
  }
  return {color: InfluxColors.Grey65}
}

export const AdaptiveZoomToggle: FC<AdaptiveZoomToggleProps> = ({
  adaptiveZoomHide,
  update,
  testID = 'adaptive-zoom-toggle',
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
      testID={testID}
    >
      <SlideToggle
        active={!adaptiveZoomHide}
        size={ComponentSize.ExtraSmall}
        onChange={handleSetAdaptiveZoom}
      />
      <InputLabel style={getToggleColor(adaptiveZoomHide)}>
        Adaptive Zoom
      </InputLabel>
      <QuestionMarkTooltip
        diameter={16}
        tooltipContents="When enabled, will re-query on the selected domain when zooming in on the graph. Requires window period set to Auto."
        tooltipStyle={{fontSize: '13px', padding: '8px'}}
      />
    </FlexBox>
  )
}
