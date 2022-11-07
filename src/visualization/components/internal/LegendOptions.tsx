// Libraries
import React, {FC, useCallback, useState} from 'react'
import {debounce} from 'lodash'

// Components
import {
  AlignItems,
  Appearance,
  ComponentColor,
  ComponentSize,
  FlexBox,
  FlexDirection,
  Form,
  InputLabel,
  InputToggleType,
  RangeSlider,
  SlideToggle,
  Toggle,
} from '@influxdata/clockface'

// Constants
import {
  LEGEND_OPACITY_DEFAULT,
  LEGEND_OPACITY_MAXIMUM,
  LEGEND_OPACITY_MINIMUM,
  LEGEND_OPACITY_STEP,
  LEGEND_ORIENTATION_THRESHOLD_HORIZONTAL,
  LEGEND_ORIENTATION_THRESHOLD_VERTICAL,
} from 'src/visualization/constants'

// Metrics
import {event} from 'src/cloud/utils/reporting'

// Styles
import 'src/visualization/components/internal/LegendOptions.scss'

// Utils
import {convertUserInputToNumOrNaN} from 'src/shared/utils/convertUserInput'

interface OrientationToggleProps {
  eventName: string
  graphType: string
  legendOrientation: number
  parentName: string
  handleSetOrientation: (threshold: number) => void
  testID?: string
}

interface OpacitySliderProps {
  legendOpacity: number
  setOpacity: (value: number) => void
  testID?: string
}

interface ColorizeRowsToggleProps {
  legendColorizeRows: boolean
  handleSetColorization: () => void
  testID?: string
}

export const OrientationToggle: FC<OrientationToggleProps> = ({
  eventName,
  graphType,
  legendOrientation,
  parentName,
  handleSetOrientation,
  testID = 'orientation-toggle',
}) => {
  const setOrientation = (orientation: string): void => {
    if (orientation === 'vertical') {
      handleSetOrientation(LEGEND_ORIENTATION_THRESHOLD_VERTICAL)
    } else {
      handleSetOrientation(LEGEND_ORIENTATION_THRESHOLD_HORIZONTAL)
    }
    event(`${eventName}.${orientation}`, {
      type: graphType,
    })
  }
  return (
    <FlexBox
      direction={FlexDirection.Column}
      margin={ComponentSize.Large}
      alignItems={AlignItems.FlexStart}
      className="legend-orientation-toggle"
      testID={testID}
    >
      <Form.Element label="Orientation">
        <Toggle
          tabIndex={1}
          value="horizontal"
          className="legend-orientation--horizontal"
          id={`${parentName}-orientation--horizontal`}
          name={`${parentName}-orientation--horizontal`}
          checked={
            legendOrientation === LEGEND_ORIENTATION_THRESHOLD_HORIZONTAL
          }
          onChange={setOrientation}
          type={InputToggleType.Radio}
          size={ComponentSize.ExtraSmall}
          color={ComponentColor.Primary}
          appearance={Appearance.Outline}
        >
          <InputLabel
            active={
              legendOrientation === LEGEND_ORIENTATION_THRESHOLD_HORIZONTAL
            }
            htmlFor={`${parentName}-orientation--horizontal`}
          >
            Horizontal
          </InputLabel>
        </Toggle>
        <Toggle
          tabIndex={2}
          value="vertical"
          className="legend-orientation--vertical"
          id={`${parentName}-orientation--vertical`}
          name={`${parentName}-orientation--vertical`}
          checked={legendOrientation <= 0}
          onChange={setOrientation}
          type={InputToggleType.Radio}
          size={ComponentSize.ExtraSmall}
          color={ComponentColor.Primary}
          appearance={Appearance.Outline}
        >
          <InputLabel
            active={legendOrientation <= 0}
            htmlFor={`${parentName}-orientation--vertical`}
          >
            Vertical
          </InputLabel>
        </Toggle>
      </Form.Element>
    </FlexBox>
  )
}

export const OpacitySlider: FC<OpacitySliderProps> = props => {
  let validOpacity = LEGEND_OPACITY_DEFAULT
  if (
    typeof props.legendOpacity === 'number' &&
    props.legendOpacity === props.legendOpacity &&
    props.legendOpacity >= LEGEND_OPACITY_MINIMUM &&
    props.legendOpacity <= LEGEND_OPACITY_MAXIMUM
  ) {
    validOpacity = props.legendOpacity
  }
  const [opacity, setOpacity] = useState(validOpacity)
  const setOpacityDebounced = useCallback(debounce(props.setOpacity, 350), [])

  const percentLegendOpacity = (opacity * 100).toFixed(0)

  return (
    <Form.Element
      className="legend-opacity-slider"
      label={`Opacity: ${percentLegendOpacity}%`}
      testID={props.testID}
    >
      <RangeSlider
        max={LEGEND_OPACITY_MAXIMUM}
        min={LEGEND_OPACITY_MINIMUM}
        step={LEGEND_OPACITY_STEP}
        value={opacity}
        onChange={evt => {
          const value = convertUserInputToNumOrNaN(evt)
          setOpacity(value)
          setOpacityDebounced(value)
        }}
        hideLabels={true}
      />
    </Form.Element>
  )
}

export const ColorizeRowsToggle: FC<ColorizeRowsToggleProps> = ({
  legendColorizeRows,
  handleSetColorization,
  testID = 'colorize-rows-toggle',
}) => {
  return (
    <FlexBox
      direction={FlexDirection.Row}
      alignItems={AlignItems.Center}
      margin={ComponentSize.Medium}
      stretchToFitWidth={true}
      className="legend-colorize-rows-toggle"
      testID={testID}
    >
      <SlideToggle
        active={legendColorizeRows}
        size={ComponentSize.ExtraSmall}
        onChange={handleSetColorization}
      />
      <InputLabel>Colorize Rows</InputLabel>
    </FlexBox>
  )
}
