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
  ComponentSize,
  ComponentStatus,
  Form,
  Grid,
  Input,
  InputLabel,
  InputType,
  RangeSlider,
  SlideToggle,
  FlexBox,
  FlexDirection,
  AlignItems,
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
} from 'src/shared/constants'

interface OwnProps {
  onLegendOpacityChange: (opacity: number) => void
  onLegendOrientationThresholdChange: (threshold: number) => void
  onLegendColorizeRowsChange: (colorize: boolean) => void
}

type ReduxProps = ConnectedProps<typeof connector>
type Props = OwnProps & ReduxProps

const LegendOrientation: FC<Props> = props => {
  const {
    legendOpacity,
    onLegendOpacityChange,
    legendOrientationThreshold,
    onLegendOrientationThresholdChange,
    legendColorizeRows,
    onLegendColorizeRowsChange,
  } = props

  const [thresholdInputStatus, setThresholdInputStatus] = useState(
    ComponentStatus.Default
  )
  const [thresholdInput, setThresholdInput] = useState(
    legendOrientationThreshold
  )
  const [colorizeRowsInput, setColorizeRowsInput] = useState(legendColorizeRows)

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
      onLegendOrientationThresholdChange(value)
    }
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

  const toggleStyle = {marginTop: 4}

  const toggleLabelStyle = {color: '#999dab'}

  // without the toFixed(0) sometimes you
  // can get numbers like 45.000009% which we want to avoid
  const percentLegendOpacity = (legendOpacity * 100).toFixed(0)

  return (
    <Grid.Column>
      <h5 className="view-options--header">Legend</h5>
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
