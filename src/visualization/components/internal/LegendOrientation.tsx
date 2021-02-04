// Libraries
import React, {ChangeEvent, FC, useState} from 'react'

// Utils
import {convertUserInputToNumOrNaN} from 'src/shared/utils/convertUserInput'
import {isFlagEnabled} from 'src/shared/utils/featureFlag'

// Components
import {
  ComponentSize,
  ComponentStatus,
  Form,
  Input,
  InputLabel,
  InputType,
  RangeSlider,
  SlideToggle,
  FlexBox,
  FlexDirection,
  AlignItems,
} from '@influxdata/clockface'

// Types
import {VisualizationOptionProps} from 'src/visualization'
import {
  BandViewProperties,
  XYViewProperties,
  LinePlusSingleStatProperties,
  HeatmapViewProperties,
  HistogramViewProperties,
  MosaicViewProperties,
  ScatterViewProperties,
} from 'src/types'

// Constants
import {
  LEGEND_OPACITY_MAXIMUM,
  LEGEND_OPACITY_MINIMUM,
  LEGEND_OPACITY_STEP,
} from 'src/visualization/constants'

interface Props extends VisualizationOptionProps {
  properties:
    | BandViewProperties
    | XYViewProperties
    | LinePlusSingleStatProperties
    | HeatmapViewProperties
    | HistogramViewProperties
    | MosaicViewProperties
    | ScatterViewProperties
}

const LegendOrientation: FC<Props> = ({properties, update}) => {
  const legendOpacity = properties?.legendOpacity

  const [thresholdInputStatus, setThresholdInputStatus] = useState(
    ComponentStatus.Default
  )

  if (!isFlagEnabled('legendOrientation')) {
    return null
  }

  const handleSetThreshold = (event: ChangeEvent<HTMLInputElement>): void => {
    const value = convertUserInputToNumOrNaN(event)

    if (isNaN(value)) {
      setThresholdInputStatus(ComponentStatus.Error)
    } else {
      setThresholdInputStatus(ComponentStatus.Default)
      update({
        legendOrientationThreshold: value,
      })
    }
  }

  const handleSetOpacity = (event: ChangeEvent<HTMLInputElement>): void => {
    const value = convertUserInputToNumOrNaN(event)

    if (isNaN(value) || value < LEGEND_OPACITY_MINIMUM) {
      update({
        legendOpacity: LEGEND_OPACITY_MAXIMUM,
      })
    } else {
      update({
        legendOpacity: value,
      })
    }
  }

  const handleSetColorization = (): void => {
    update({
      legendColorizeRows: !properties.legendColorizeRows,
    })
  }

  const toggleStyle = {marginTop: 4}
  const toggleLabelStyle = {color: '#999dab'}

  return (
    <>
      <Form.Element
        label="Rotation Threshold"
        helpText="Legends with column count exceeding this threshold appear vertically instead of horizontally"
      >
        <Input
          name="legend-columns"
          onChange={handleSetThreshold}
          onFocus={handleSetThreshold}
          placeholder="Enter a number"
          status={thresholdInputStatus}
          type={InputType.Number}
          value={properties.legendOrientationThreshold}
        />
      </Form.Element>
      <Form.Element label={`Opacity: ${legendOpacity.toFixed(2)}`}>
        <RangeSlider
          max={LEGEND_OPACITY_MAXIMUM}
          min={LEGEND_OPACITY_MINIMUM}
          step={LEGEND_OPACITY_STEP}
          value={legendOpacity}
          onChange={handleSetOpacity}
        />
      </Form.Element>
      <FlexBox
        direction={FlexDirection.Row}
        alignItems={AlignItems.Center}
        margin={ComponentSize.Medium}
        stretchToFitWidth={true}
        style={toggleStyle}
      >
        <SlideToggle
          active={properties.legendColorizeRows}
          size={ComponentSize.ExtraSmall}
          onChange={handleSetColorization}
        />
        <InputLabel style={toggleLabelStyle}>Colorize Rows</InputLabel>
      </FlexBox>
    </>
  )
}

export default LegendOrientation
