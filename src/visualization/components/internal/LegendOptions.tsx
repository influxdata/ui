// Libraries
import React, {ChangeEvent, CSSProperties, FC} from 'react'

// Components
import {
  AlignItems,
  Appearance,
  ComponentColor,
  ComponentSize,
  FlexBox,
  FlexDirection,
  Form,
  InfluxColors,
  InputLabel,
  InputToggleType,
  RangeSlider,
  SlideToggle,
  Toggle,
} from '@influxdata/clockface'

// Constants
import {
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

interface OrientationToggleProps {
  graphType: string
  legendOrientation: number
  handleSetOrientation: (threshold: number) => void
}

interface OpacitySliderProps {
  legendOpacity: number
  handleSetOpacity: (event: ChangeEvent<HTMLInputElement>) => void
}

interface ColorizeRowsToggleProps {
  legendColorizeRows: boolean
  handleSetColorization: () => void
}

const eventPrefix = 'visualization.customize'

const getToggleColor = (toggle: boolean): CSSProperties => {
  if (toggle) {
    return {color: InfluxColors.Cloud}
  }
  return {color: InfluxColors.Sidewalk}
}

export const OrientationToggle: FC<OrientationToggleProps> = ({
  graphType,
  legendOrientation,
  handleSetOrientation,
}) => {
  const setOrientation = (orientation: string): void => {
    if (orientation === 'vertical') {
      handleSetOrientation(LEGEND_ORIENTATION_THRESHOLD_VERTICAL)
    } else {
      handleSetOrientation(LEGEND_ORIENTATION_THRESHOLD_HORIZONTAL)
    }
    event(`${eventPrefix}.legend.orientation.${orientation}`, {
      type: graphType,
    })
  }
  return (
    <FlexBox
      direction={FlexDirection.Column}
      margin={ComponentSize.Large}
      alignItems={AlignItems.FlexStart}
      className="legend-orientation-toggle"
    >
      <InputLabel id="legend-orientation-label">Orientation</InputLabel>
      <Toggle
        tabIndex={1}
        value="horizontal"
        name="legendOr"
        className="legend-orientation--horizontal"
        id="legend-orientation--horizontal"
        checked={legendOrientation === LEGEND_ORIENTATION_THRESHOLD_HORIZONTAL}
        onChange={setOrientation}
        type={InputToggleType.Radio}
        size={ComponentSize.ExtraSmall}
        color={ComponentColor.Primary}
        appearance={Appearance.Outline}
      >
        <InputLabel
          active={legendOrientation === LEGEND_ORIENTATION_THRESHOLD_HORIZONTAL}
          htmlFor="legend-orientation--horizontal"
        >
          Horizontal
        </InputLabel>
      </Toggle>
      <Toggle
        tabIndex={2}
        value="vertical"
        className="legend-orientation--vertical"
        id="legend-orientation--vertical"
        name="lengendOr"
        checked={legendOrientation === LEGEND_ORIENTATION_THRESHOLD_VERTICAL}
        onChange={setOrientation}
        type={InputToggleType.Radio}
        size={ComponentSize.ExtraSmall}
        color={ComponentColor.Primary}
        appearance={Appearance.Outline}
      >
        <InputLabel
          active={legendOrientation === LEGEND_ORIENTATION_THRESHOLD_VERTICAL}
          htmlFor="legend-orientation--vertical"
        >
          Vertical
        </InputLabel>
      </Toggle>
    </FlexBox>
  )
}

export const OpacitySlider: FC<OpacitySliderProps> = ({
  legendOpacity,
  handleSetOpacity,
}) => {
  // without the toFixed(0) sometimes you
  // can get numbers like 45.000009% which we want to avoid
  const percentLegendOpacity = (legendOpacity * 100).toFixed(0)
  return (
    <Form.Element
      className="legend-opacity-slider"
      label={`Opacity: ${percentLegendOpacity}%`}
    >
      <RangeSlider
        max={LEGEND_OPACITY_MAXIMUM}
        min={LEGEND_OPACITY_MINIMUM}
        step={LEGEND_OPACITY_STEP}
        value={legendOpacity}
        onChange={handleSetOpacity}
        hideLabels={true}
      />
    </Form.Element>
  )
}

export const ColorizeRowsToggle: FC<ColorizeRowsToggleProps> = ({
  legendColorizeRows,
  handleSetColorization,
}) => {
  return (
    <FlexBox
      direction={FlexDirection.Row}
      alignItems={AlignItems.Center}
      margin={ComponentSize.Medium}
      stretchToFitWidth={true}
      className="legend-colorize-rows-toggle"
    >
      <SlideToggle
        active={legendColorizeRows}
        size={ComponentSize.ExtraSmall}
        onChange={handleSetColorization}
      />
      <InputLabel style={getToggleColor(legendColorizeRows)}>
        Colorize Rows
      </InputLabel>
    </FlexBox>
  )
}
