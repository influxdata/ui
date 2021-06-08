// Libraries
import React, {ChangeEvent, CSSProperties, FC} from 'react'
import {InfluxColors} from '@influxdata/clockface'

// Utils
import {convertUserInputToNumOrNaN} from 'src/shared/utils/convertUserInput'
import {upperFirst} from 'src/shared/utils/upperFirst'

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
  LegendDisplayStatus,
} from 'src/visualization/constants'

// Metrics
import {event} from 'src/cloud/utils/reporting'

interface HoverLegendToggleProps {
  legendHide: boolean
  handleSetHoverLegendHide: () => void
}

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

const eventPrefix = 'visualization.customize'

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
      return upperFirst(LegendDisplayStatus.HIDE)
    }
    return upperFirst(LegendDisplayStatus.SHOW)
  }

  return (
    <FlexBox
      direction={FlexDirection.Row}
      alignItems={AlignItems.Center}
      margin={ComponentSize.Medium}
      stretchToFitWidth={true}
      style={{marginTop: '0.5em', marginBottom: '1.5em'}}
      testID="hover-legend-toggle"
    >
      <SlideToggle
        active={!legendHide}
        size={ComponentSize.ExtraSmall}
        onChange={handleSetHoverLegendHide}
      />
      <InputLabel style={getToggleColor(!legendHide)}>
        Hover Legend {getHoverLegendHideStatus(legendHide)}
      </InputLabel>
    </FlexBox>
  )
}

const OrientationToggle: FC<OrientationToggleProps> = ({
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
      style={{marginBottom: '1.5em'}}
    >
      <InputLabel style={{color: InfluxColors.Cloud}}>Orientation</InputLabel>
      <Toggle
        tabIndex={1}
        value="horizontal"
        id="horizontal-legend-orientation"
        name="legendOr"
        checked={legendOrientation === LEGEND_ORIENTATION_THRESHOLD_HORIZONTAL}
        onChange={setOrientation}
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
        onChange={setOrientation}
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
    const metricValue = properties.legendHide
      ? LegendDisplayStatus.HIDE
      : LegendDisplayStatus.SHOW
    event(`${eventPrefix}.hoverLegend.${metricValue}`, {
      type: properties.type,
    })
  }

  const handleSetOrientation = (threshold: number): void => {
    update({
      legendOrientationThreshold: threshold,
    })
    // eventing is done by the consuming component because there are only 2 values
  }

  const handleSetOpacity = (e: ChangeEvent<HTMLInputElement>): void => {
    const value = convertUserInputToNumOrNaN(e)

    if (isNaN(value) || value < LEGEND_OPACITY_MINIMUM) {
      update({
        legendOpacity: LEGEND_OPACITY_MAXIMUM,
      })
      event(`${eventPrefix}.legend.opacity`, {
        type: properties.type,
        opacity: LEGEND_OPACITY_MAXIMUM,
      })
    } else {
      update({
        legendOpacity: value,
      })
      event(`${eventPrefix}.legend.opacity`, {
        type: properties.type,
        opacity: value,
      })
    }
  }

  const handleSetColorization = (): void => {
    update({
      legendColorizeRows: !properties.legendColorizeRows,
    })
    event(
      `${eventPrefix}.legend.colorizeRows.${Boolean(
        properties.legendColorizeRows
      )}`,
      {
        type: properties.type,
      }
    )
  }

  return (
    <>
      {properties.type === 'xy' ||
      properties.type === 'line-plus-single-stat' ||
      properties.type === 'band' ? (
        <HoverLegendToggle
          legendHide={properties.legendHide}
          handleSetHoverLegendHide={handleSetHoverLegendHide}
        />
      ) : null}
      <OrientationToggle
        graphType={properties.type}
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
