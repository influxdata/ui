// Libraries
import React, {ChangeEvent, CSSProperties, FC, useEffect, useState} from 'react'

// Utils
import {convertUserInputToNumOrNaN} from 'src/shared/utils/convertUserInput'

// Components
import {
  AlignItems,
  Appearance,
  ButtonShape,
  Columns,
  ComponentColor,
  ComponentSize,
  FlexBox,
  FlexDirection,
  Form,
  Grid,
  InfluxColors,
  InputLabel,
  InputToggleType,
  RangeSlider,
  SelectGroup,
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

// Styles
import 'src/visualization/components/internal/LegendOrientation.scss'

interface HoverLegendToggleProps {
  properties:
    | BandViewProperties
    | XYViewProperties
    | LinePlusSingleStatProperties
  handlers: {
    [handle: string]: (arg?: any) => void
  }
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

const OpacitySlider: FC<OpacitySliderProps> = ({
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

const HoverLegendToggle: FC<HoverLegendToggleProps> = ({
  properties,
  handlers,
}) => {
  const {
    handleSetHoverLegendHide,
    handleSetOrientation,
    handleSetOpacity,
    handleSetColorization,
  } = handlers

  const showStaticLegend = !!properties?.staticLegend?.show
  const showLegend = !properties?.legendHide
  const [showOptions, setShowOptions] = useState<boolean>(
    showLegend || showStaticLegend
  )

  useEffect(() => {
    setShowOptions(showLegend || showStaticLegend)
  }, [showLegend, showStaticLegend])

  return (
    <Form.Element label="Hover Legend" className="legend-options">
      <Grid>
        <Grid.Row>
          <Grid.Column widthXS={Columns.Twelve}>
            <SelectGroup
              shape={ButtonShape.StretchToFit}
              testID="hover-legend-toggle"
            >
              <SelectGroup.Option
                name="hover-legend-hide"
                id="radio_hover_legend_hide"
                titleText="Hide"
                active={properties.legendHide}
                onClick={handleSetHoverLegendHide}
                value={true}
              >
                Hide
              </SelectGroup.Option>
              <SelectGroup.Option
                name="hover-legend-show"
                id="radio_hover_legend_show"
                titleText="Show"
                active={!properties.legendHide}
                onClick={handleSetHoverLegendHide}
                value={false}
              >
                Show
              </SelectGroup.Option>
            </SelectGroup>
          </Grid.Column>
        </Grid.Row>
        {showOptions && (
          <Grid.Row>
            <Grid.Column
              widthXS={Columns.Twelve}
              className="legend-options--show"
            >
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
            </Grid.Column>
          </Grid.Row>
        )}
      </Grid>
    </Form.Element>
  )
}

const LegendOrientation: FC<LegendOrientationProps> = ({
  properties,
  update,
}) => {
  const handleSetHoverLegendHide = (legendHide: boolean): void => {
    update({
      legendHide,
    })
    const metricValue = legendHide
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
    // eventing is done by <OrientationToggle> because UI defines orientation
    // as either horizontal or vertical
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

  return properties.type === 'xy' ||
    properties.type === 'line-plus-single-stat' ||
    properties.type === 'band' ? (
    <HoverLegendToggle
      properties={properties}
      handlers={{
        handleSetHoverLegendHide,
        handleSetOrientation,
        handleSetOpacity,
        handleSetColorization,
      }}
    />
  ) : (
    <>
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
