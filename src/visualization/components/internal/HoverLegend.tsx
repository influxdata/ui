// Libraries
import React, {FC, useState} from 'react'

// Components
import {
  ButtonShape,
  Columns,
  Form,
  Grid,
  SelectGroup,
} from '@influxdata/clockface'
import {
  OrientationToggle,
  OpacitySlider,
  ColorizeRowsToggle,
} from 'src/visualization/components/internal/LegendOptions'

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
  LEGEND_COLORIZE_ROWS_DEFAULT,
  LEGEND_HIDE_DEFAULT,
  LEGEND_OPACITY_DEFAULT,
  LEGEND_OPACITY_MAXIMUM,
  LEGEND_OPACITY_MINIMUM,
  LEGEND_ORIENTATION_THRESHOLD_DEFAULT,
  LEGEND_ORIENTATION_THRESHOLD_HORIZONTAL,
  LEGEND_ORIENTATION_THRESHOLD_VERTICAL,
  LegendDisplayStatus,
} from 'src/visualization/constants'

// Metrics
import {event} from 'src/cloud/utils/reporting'

// Styles
import 'src/visualization/components/internal/LegendOptions.scss'

interface HoverLegendToggleProps {
  properties:
    | BandViewProperties
    | XYViewProperties
    | LinePlusSingleStatProperties
  handlers: {
    [handle: string]: (arg?: any) => void
  }
}

interface HoverLegendProps extends VisualizationOptionProps {
  properties:
    | BandViewProperties
    | XYViewProperties
    | LinePlusSingleStatProperties
    | HeatmapViewProperties
    | HistogramViewProperties
    | MosaicViewProperties
    | ScatterViewProperties
}

const eventPrefix = 'visualization.customize.hoverLegend'

const HoverLegendToggle: FC<HoverLegendToggleProps> = ({
  properties,
  handlers,
}) => {
  const {
    legendColorizeRows = LEGEND_COLORIZE_ROWS_DEFAULT,
    legendOpacity = LEGEND_OPACITY_DEFAULT,
    legendOrientationThreshold = LEGEND_ORIENTATION_THRESHOLD_DEFAULT,
    legendHide = LEGEND_HIDE_DEFAULT,
  } = properties
  const {
    handleSetHoverLegendHide,
    handleSetOrientation,
    setOpacity,
    handleSetColorization,
  } = handlers

  const showLegend = !legendHide
  const [showOptions, setShowOptions] = useState<boolean>(showLegend)

  const handleChooseHoverLegend = (value: string) => {
    setShowOptions(value === LegendDisplayStatus.SHOW)
    handleSetHoverLegendHide(value === LegendDisplayStatus.HIDE)
  }

  return (
    <Form.Element label="Display Hover Legend" className="legend-options">
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
                active={legendHide}
                onClick={handleChooseHoverLegend}
                value={LegendDisplayStatus.HIDE}
              >
                Hide
              </SelectGroup.Option>
              <SelectGroup.Option
                name="hover-legend-show"
                id="radio_hover_legend_show"
                titleText="Show"
                active={!legendHide}
                onClick={handleChooseHoverLegend}
                value={LegendDisplayStatus.SHOW}
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
                eventName={`${eventPrefix}.orientation`}
                graphType={properties.type}
                legendOrientation={legendOrientationThreshold}
                parentName="hover-legend"
                handleSetOrientation={handleSetOrientation}
                testID="hover-legend-orientation-toggle"
              />
              <OpacitySlider
                legendOpacity={legendOpacity}
                setOpacity={setOpacity}
                testID="hover-legend-opacity-slider"
              />
              <ColorizeRowsToggle
                legendColorizeRows={legendColorizeRows}
                handleSetColorization={handleSetColorization}
                testID="hover-legend-colorize-rows-toggle"
              />
            </Grid.Column>
          </Grid.Row>
        )}
      </Grid>
    </Form.Element>
  )
}

const HoverLegend: FC<HoverLegendProps> = ({properties, update}) => {
  const {
    legendColorizeRows = LEGEND_COLORIZE_ROWS_DEFAULT,
    legendOpacity = LEGEND_OPACITY_DEFAULT,
    legendOrientationThreshold = LEGEND_ORIENTATION_THRESHOLD_DEFAULT,
  } = properties

  const handleSetHoverLegendHide = (legendHide: boolean): void => {
    update({
      legendHide,
    })
    const metricValue = legendHide
      ? LegendDisplayStatus.HIDE
      : LegendDisplayStatus.SHOW
    event(`${eventPrefix}.${metricValue}`, {
      type: properties.type,
    })
  }

  const handleSetOrientation = (threshold: number): void => {
    let validThreshold: number
    if (
      typeof threshold !== 'number' ||
      threshold !== threshold ||
      threshold > 0
    ) {
      validThreshold = LEGEND_ORIENTATION_THRESHOLD_HORIZONTAL
    } else {
      validThreshold = LEGEND_ORIENTATION_THRESHOLD_VERTICAL
    }
    update({
      legendOrientationThreshold: validThreshold,
    })
    // eventing is done by <OrientationToggle> because
    // UI's definition of orientation is either horizontal or vertical
    // which is less intricate than Giraffe's
  }

  const setOpacity = (opacity: number): void => {
    if (isNaN(opacity) || opacity < LEGEND_OPACITY_MINIMUM) {
      update({
        legendOpacity: LEGEND_OPACITY_MAXIMUM,
      })
      event(`${eventPrefix}.opacity`, {
        type: properties.type,
        opacity: LEGEND_OPACITY_MAXIMUM,
      })
    } else {
      update({
        legendOpacity: opacity,
      })
      event(`${eventPrefix}.opacity`, {
        type: properties.type,
        opacity,
      })
    }
  }

  const handleSetColorization = (): void => {
    update({
      legendColorizeRows: !legendColorizeRows,
    })
    event(`${eventPrefix}.colorizeRows.${!legendColorizeRows}`, {
      type: properties.type,
    })
  }

  return properties.type === 'xy' ||
    properties.type === 'line-plus-single-stat' ||
    properties.type === 'band' ? (
    <HoverLegendToggle
      properties={properties}
      handlers={{
        handleSetHoverLegendHide,
        handleSetOrientation,
        setOpacity,
        handleSetColorization,
      }}
    />
  ) : (
    <>
      <OrientationToggle
        eventName={`${eventPrefix}.orientation`}
        graphType={properties.type}
        legendOrientation={legendOrientationThreshold}
        parentName="hover-legend"
        handleSetOrientation={handleSetOrientation}
        testID="hover-legend-orientation-toggle"
      />
      <OpacitySlider
        legendOpacity={legendOpacity}
        setOpacity={setOpacity}
        testID="hover-legend-opacity-slider"
      />
      <ColorizeRowsToggle
        legendColorizeRows={legendColorizeRows}
        handleSetColorization={handleSetColorization}
        testID="hover-legend-colorize-rows-toggle"
      />
    </>
  )
}

export default HoverLegend
