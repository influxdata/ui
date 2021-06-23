// Libraries
import React, {ChangeEvent, FC, useEffect, useState} from 'react'

// Utils
import {convertUserInputToNumOrNaN} from 'src/shared/utils/convertUserInput'

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
  LEGEND_OPACITY_MAXIMUM,
  LEGEND_OPACITY_MINIMUM,
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

const eventPrefix = 'visualization.customize'

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

const HoverLegend: FC<HoverLegendProps> = ({properties, update}) => {
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

export default HoverLegend
