// Libraries
import React, {ChangeEvent, CSSProperties, FC} from 'react'
import {InfluxColors} from '@influxdata/clockface'

// Utils
import {convertUserInputToNumOrNaN} from 'src/shared/utils/convertUserInput'

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
  LEGEND_ORIENTATION_THRESHOLD_HORIZONTAL,
  LEGEND_ORIENTATION_THRESHOLD_VERTICAL,
} from 'src/visualization/constants'

interface HoverLegendToggleProps {
  legendHide: boolean
  handleSetHoverLegendHide: () => void
}

interface OrientationToggleProps {
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
interface LegendOrientationProps extends VisualizationOptionProps {
  properties:
    | BandViewProperties
    | XYViewProperties
    | LinePlusSingleStatProperties
    | HeatmapViewProperties
    | HistogramViewProperties
    | MosaicViewProperties
    | ScatterViewProperties
}

const getToggleColor = (toggle: boolean): CSSProperties => {
  if (toggle) {
    return {color: InfluxColors.Cloud}
  }
  return {color: InfluxColors.Sidewalk}
}

const HoverLegendToggle: FC<HoverLegendToggleProps> = ({
  legendHide,
  handleSetHoverLegendHide,
}) => {
  const getHoverLegendHideStatus = (legendHide: boolean): string => {
    if (legendHide) {
      return 'Hide'
    }
    return 'Show'
  }

  const getHoverLegendHideStatus = (legendHide: boolean): string => {
    if (legendHide) {
      return 'Hidden'
    }
    return 'Shown'
  }

  const handleSetHoverLegendHide = (): void => {
    update({
      legendHide: !properties.legendHide,
    })
  }

  const handleSetColorization = (): void => {
    update({
      legendColorizeRows: !properties.legendColorizeRows,
    })
  }

  const toggleStyle = {marginTop: '1em'}
  const toggleLabelStyle = {color: '#999dab'}

  // without the toFixed(0) sometimes you
  // can get numbers like 45.000009% which we want to avoid
  const percentLegendOpacity = (legendOpacity * 100).toFixed(0)

const OrientationToggle: FC<OrientationToggleProps> = ({
  legendOrientation,
  handleSetOrientation,
}) => {
  return (
    <FlexBox
      direction={FlexDirection.Column}
      margin={ComponentSize.Large}
      alignItems={AlignItems.FlexStart}
      style={{marginBottom: '1.5em'}}
    >
      <InputLabel style={toggleLabelStyle}>Orientation</InputLabel>
      <Toggle
        tabIndex={1}
        value="horizontal"
        id="horizontal-legend-orientation"
        name="legendOr"
        checked={legendOrientation === LEGEND_ORIENTATION_THRESHOLD_HORIZONTAL}
        onChange={() =>
          handleSetOrientation(LEGEND_ORIENTATION_THRESHOLD_HORIZONTAL)
        }
        type={InputToggleType.Radio}
        size={ComponentSize.ExtraSmall}
        color={ComponentColor.Primary}
        appearance={Appearance.Outline}
        style={{marginBottom: 6}}
      >
        <InputLabel
          active={legendOrientation === LEGEND_ORIENTATION_THRESHOLD_HORIZONTAL}
          htmlFor="horizontal-legend-orientation"
        >
          Horizontal
        </InputLabel>
      </Toggle>
      <Toggle
        tabIndex={2}
        value="vertical"
        id="vertical-legend-orientation"
        name="lengendOr"
        checked={legendOrientation === LEGEND_ORIENTATION_THRESHOLD_VERTICAL}
        onChange={() =>
          handleSetOrientation(LEGEND_ORIENTATION_THRESHOLD_VERTICAL)
        }
        type={InputToggleType.Radio}
        size={ComponentSize.ExtraSmall}
        color={ComponentColor.Primary}
        appearance={Appearance.Outline}
      >
        <InputLabel
          active={legendOrientation === LEGEND_ORIENTATION_THRESHOLD_VERTICAL}
          htmlFor="vertical-legend-orientation"
        >
          Vertical
        </InputLabel>
      </Toggle>
    </FlexBox>
  )
}

const OpacitySlider: FC<OpacitySliderProps> = ({
  legendOpacity,
  handleSetOpacity,
}) => {
  // without the toFixed(0) sometimes you
  // can get numbers like 45.000009% which we want to avoid
  const percentLegendOpacity = (legendOpacity * 100).toFixed(0)
  return (
    <Form.Element label={`Opacity: ${percentLegendOpacity}%`}>
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

const ColorizeRowsToggle: FC<ColorizeRowsToggleProps> = ({
  legendColorizeRows,
  handleSetColorization,
}) => {
  return (
    <FlexBox
      direction={FlexDirection.Row}
      alignItems={AlignItems.Center}
      margin={ComponentSize.Medium}
      stretchToFitWidth={true}
      style={{marginTop: '1em'}}
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

const LegendOrientation: FC<LegendOrientationProps> = ({
  properties,
  update,
}) => {
  const handleSetHoverLegendHide = (): void => {
    update({
      legendHide: !properties.legendHide,
    })
  }

  const handleSetOrientation = (threshold: number): void => {
    update({
      legendOrientationThreshold: threshold,
    })
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

  return (
    <>
      <FlexBox
        direction={FlexDirection.Row}
        alignItems={AlignItems.Center}
        margin={ComponentSize.Medium}
        stretchToFitWidth={true}
        style={{marginTop: '0.5em', marginBottom: '1.5em'}}
      >
        <SlideToggle
          active={!properties.legendHide}
          size={ComponentSize.ExtraSmall}
          onChange={handleSetHoverLegendHide}
        />
        <InputLabel style={toggleLabelStyle}>
          Hover Legend {getHoverLegendHideStatus(properties.legendHide)}
        </InputLabel>
      </FlexBox>
      {orientationToggle}
      <Form.Element label={`Opacity: ${percentLegendOpacity}%`}>
        <RangeSlider
          max={LEGEND_OPACITY_MAXIMUM}
          min={LEGEND_OPACITY_MINIMUM}
          step={LEGEND_OPACITY_STEP}
          value={legendOpacity}
          onChange={handleSetOpacity}
          hideLabels={true}
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
      ) : null}
      <OrientationToggle
        legendOrientation={properties.legendOrientationThreshold}
        handleSetOrientation={handleSetOrientation}
      />
      <OpacitySlider
        legendOpacity={properties.legendOpacity}
        handleSetOpacity={handleSetOpacity}
      />
      <ColorizeRowsToggle
        legendColorizeRows={properties.legendColorizeRows}
        handleSetColorization={handleSetColorization}
      />
    </>
  )
}

export default LegendOrientation
