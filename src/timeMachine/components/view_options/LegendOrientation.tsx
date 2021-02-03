// Libraries
import React, {ChangeEvent, FC, useState} from 'react'
import {connect, ConnectedProps} from 'react-redux'
import {get} from 'lodash'

// Utils
import {convertUserInputToNumOrNaN} from 'src/shared/utils/convertUserInput'
import {isFlagEnabled} from 'src/shared/utils/featureFlag'
import {getActiveTimeMachine} from 'src/timeMachine/selectors'

// Components
import {
  AlignItems,
  Appearance,
  ComponentColor,
  ComponentSize,
  FlexBox,
  FlexDirection,
  Form,
  Grid,
  InputLabel,
  InputToggleType,
  RangeSlider,
  SlideToggle,
  Toggle,
} from '@influxdata/clockface'

// Types
import {AppState} from 'src/types'

// Constants
import {
  LEGEND_OPACITY_DEFAULT,
  LEGEND_OPACITY_MAXIMUM,
  LEGEND_OPACITY_MINIMUM,
  LEGEND_OPACITY_STEP,
  LEGEND_COLORIZE_ROWS_DEFAULT,
  LEGEND_ORIENTATION_THRESHOLD_DEFAULT,
  LEGEND_ORIENTATION_THRESHOLD_HORIZONTAL,
  LEGEND_ORIENTATION_THRESHOLD_VERTICAL,
} from 'src/shared/constants'

interface OwnProps {
  onLegendOpacityChange: (opacity: number) => void
  onLegendOrientationThresholdChange: (threshold: number) => void
  onLegendColorizeRowsChange: (colorize: boolean) => void
}

type ReduxProps = ConnectedProps<typeof connector>
type Props = OwnProps & ReduxProps

enum OrientationDirection {
  HORIZONTAL = 'horizontal',
  VERTICAL = 'vertical',
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
const LegendOrientation: FC<Props> = props => {
  const {
    legendOpacity,
    onLegendOpacityChange,
    legendOrientationThreshold,
    onLegendOrientationThresholdChange,
    legendColorizeRows,
    onLegendColorizeRowsChange,
  } = props

  const getOrientation = threshold => {
    switch (threshold) {
      case LEGEND_ORIENTATION_THRESHOLD_HORIZONTAL:
        return OrientationDirection.HORIZONTAL
      case LEGEND_ORIENTATION_THRESHOLD_VERTICAL:
        return OrientationDirection.VERTICAL
      default:
        return LEGEND_ORIENTATION_THRESHOLD_DEFAULT
    }
  }

  const [legendOrientation, setLegendOrientation] = useState(
    getOrientation(legendOrientationThreshold)
  )
  const [colorizeRowsInput, setColorizeRowsInput] = useState(legendColorizeRows)

  if (!isFlagEnabled('legendOrientation')) {
    return null
  }

  const handleSetOrientation = (value: OrientationDirection): void => {
    let threshold = LEGEND_ORIENTATION_THRESHOLD_HORIZONTAL
    if (value === OrientationDirection.VERTICAL) {
      threshold = LEGEND_ORIENTATION_THRESHOLD_VERTICAL
    }
    setLegendOrientation(value)
    onLegendOrientationThresholdChange(threshold)
  }

  const handleSetOpacity = (event: ChangeEvent<HTMLInputElement>): void => {
    const value = convertUserInputToNumOrNaN(event)

    if (isNaN(value) || value < LEGEND_OPACITY_MINIMUM) {
      onLegendOpacityChange(LEGEND_OPACITY_MAXIMUM)
    } else {
      onLegendOpacityChange(value)
    }
  }

  const handleSetColorization = (): void => {
    const value = !colorizeRowsInput
    setColorizeRowsInput(value)
    onLegendColorizeRowsChange(value)
  }

  const toggleStyle = {marginTop: 12}

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
      <InputLabel style={toggleLabelStyle}> Legend Orientation</InputLabel>
      <Toggle
        tabIndex={1}
        value="horizontal"
        id="horizontal-legend-orientation"
        name="horizontal"
        checked={legendOrientation === OrientationDirection.HORIZONTAL}
        onChange={() => handleSetOrientation(OrientationDirection.HORIZONTAL)}
        type={InputToggleType.Radio}
        size={ComponentSize.ExtraSmall}
        color={ComponentColor.Primary}
        appearance={Appearance.Outline}
        style={{marginBottom: 6}}
      >
        <InputLabel
          active={legendOrientation === OrientationDirection.HORIZONTAL}
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
        checked={legendOrientation === OrientationDirection.VERTICAL}
        onChange={() => handleSetOrientation(OrientationDirection.VERTICAL)}
        type={InputToggleType.Radio}
        size={ComponentSize.ExtraSmall}
        color={ComponentColor.Primary}
        appearance={Appearance.Outline}
      >
        <InputLabel
          active={legendOrientation === OrientationDirection.VERTICAL}
          htmlFor="vertical-legend-orientation"
        >
          Vertical
        </InputLabel>
      </Toggle>
    </FlexBox>
  )

  return (
    <Grid.Column>
      <h5 className="view-options--header">Legend</h5>
      <div style={{paddingLeft: 8, paddingRight: 8}}>
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
            active={colorizeRowsInput}
            size={ComponentSize.ExtraSmall}
            onChange={handleSetColorization}
          />
          <InputLabel style={toggleLabelStyle}>Colorize Rows</InputLabel>
        </FlexBox>
      </div>
    </Grid.Column>
  )
}

const mstp = (state: AppState) => {
  const timeMachine = getActiveTimeMachine(state)
  const legendOrientationThreshold: number = get(
    timeMachine,
    'view.properties.legendOrientationThreshold',
    undefined
  )
  const legendOpacity: number = get(
    timeMachine,
    'view.properties.legendOpacity',
    LEGEND_OPACITY_DEFAULT
  )
  const legendColorizeRows: boolean = get(
    timeMachine,
    'view.properties.legendColorizeRows',
    LEGEND_COLORIZE_ROWS_DEFAULT
  )

  return {legendOpacity, legendOrientationThreshold, legendColorizeRows}
}

const connector = connect(mstp)
export default connector(LegendOrientation)
