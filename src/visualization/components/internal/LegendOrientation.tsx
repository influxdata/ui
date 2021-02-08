// Libraries
import React, {ChangeEvent, FC} from 'react'

// Utils
import {convertUserInputToNumOrNaN} from 'src/shared/utils/convertUserInput'
import {isFlagEnabled} from 'src/shared/utils/featureFlag'

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

/**
 *  The LegendOrientation Component consists of three properties:
 *  1.  The Orientation itself (horizontal vs. vertical); horizontal is the default
 *  2.  opacity of the legend (ranges from 20% to 100%); default is 100%
 *  3.  row colorization:  does each row have colored text (the default), or does each row have a dot of color prefacing it, with
 *  text all the same default (foreground) color
 *
 *  The above is what the user sees.
 *
 *  what is actually happening:
 *
 *    1.  Legend Orientation.  Default is horizontal
 *          behind the scenes it is a 'rotation threshold'.  if the number of items is above the threshold, then
 *          the legend is displayed vertically (each line is a column); if the number of items is below the threshold, then the legend is
 *          displayed horizontally (each line is a row).  therefore, since the default is horizontal, the numbers being set are very high
 *          for horizontal (high enough that the database would thrash out/throttle before it got that high), or low (0 for vertical, since
 *          to display something it has to be higher than zero).  The default number itself has changed, so some users may see their graphs flip
 *          (before; without the feature flag enabled, the default was hard-coded to 10; so graphs with more than 10 lines of  data in the tooltip
 *          were vertical)
 *
 *    2.  Legend Opacity.  The actual number is between the minimum .2 and the maximum 1.0; but we are displaying it as a matter of percentage
 *    3.  Row Colorization.  This is the simplest.  just a true/false flag, it is true by default.
 */
const LegendOrientation: FC<Props> = ({properties, update}) => {
  const legendOpacity = properties?.legendOpacity
  const legendOrientation = properties?.legendOrientationThreshold

  if (!isFlagEnabled('legendOrientation')) {
    return null
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

  const toggleStyle = {marginTop: 4}
  const toggleLabelStyle = {color: '#999dab'}

  // without the toFixed(0) sometimes you
  // can get numbers like 45.000009% which we want to avoid
  const percentLegendOpacity = (legendOpacity * 100).toFixed(0)

  const orientationToggle = (
    <FlexBox
      direction={FlexDirection.Column}
      margin={ComponentSize.Large}
      alignItems={AlignItems.FlexStart}
      style={{marginBottom: 18}}
    >
      <InputLabel style={toggleLabelStyle}>Legend Orientation</InputLabel>
      <Toggle
        tabIndex={1}
        value="horizontal"
        id="horizontal-legend-orientation"
        name="horizontal"
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
        name="vertical"
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

  return (
    <>
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
        <InputLabel style={toggleLabelStyle}>Colorize Rows</InputLabel>
      </FlexBox>
    </>
  )
}

export default LegendOrientation
