// Libraries
import React, {ChangeEvent, FC, useState} from 'react'

// Utils
import {convertUserInputToNumOrNaN} from 'src/shared/utils/convertUserInput'
import {isFlagEnabled} from 'src/shared/utils/featureFlag'

// Components
import {
  ComponentStatus,
  Form,
  Input,
  InputType,
  RangeSlider,
} from '@influxdata/clockface'

// Types
import {VisOptionProps} from 'src/visualization'
import {
  XYViewProperties,
  LinePlusSingleStatProperties,
  HeatmapViewProperties,
  HistogramViewProperties,
  MosaicViewProperties,
  ScatterViewProperties,
} from 'src/types'

// Constants
import {
  LEGEND_OPACITY_DEFAULT,
  LEGEND_OPACITY_MAXIMUM,
  LEGEND_OPACITY_MINIMUM,
  LEGEND_OPACITY_STEP,
} from 'src/visualization/constants'

interface Props extends VisOptionProps {
  properties:
    | XYViewProperties
    | LinePlusSingleStatProperties
    | HeatmapViewProperties
    | HistogramViewProperties
    | MosaicViewProperties
    | ScatterViewProperties
}

const LegendOrientation: FC<Props> = ({properties, update}) => {
  const legendOpacity = properties?.legendOpacity || LEGEND_OPACITY_DEFAULT
  const legendOrientationThreshold = properties?.legendOrientationThreshold

  const [thresholdInputStatus, setThresholdInputStatus] = useState(
    ComponentStatus.Default
  )
  const [thresholdInput, setThresholdInput] = useState(
    legendOrientationThreshold
  )

  if (!isFlagEnabled('legendOrientation')) {
    return null
  }

  const handleSetThreshold = (event: ChangeEvent<HTMLInputElement>): void => {
    const value = convertUserInputToNumOrNaN(event)

    setThresholdInput(value)
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
          value={thresholdInput}
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
    </>
  )
}

export default LegendOrientation
