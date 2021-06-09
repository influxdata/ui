// Libraries
import React, {ChangeEvent, FC, useState} from 'react'

// Utils
import {isFlagEnabled} from 'src/shared/utils/featureFlag'
import {convertUserInputToNumOrNaN} from 'src/shared/utils/convertUserInput'

// Components
import {
  AlignItems,
  Appearance,
  ButtonShape,
  Columns,
  ComponentSize,
  FlexBox,
  FlexDirection,
  Form,
  Grid,
  InputLabel,
  InputToggleType,
  RangeSlider,
  SelectGroup,
  Toggle,
} from '@influxdata/clockface'

// Types
import {VisualizationOptionProps} from 'src/visualization'
import {
  BandViewProperties,
  LinePlusSingleStatProperties,
  StaticLegend,
  XYViewProperties,
} from 'src/types'

// Constants
import {
  STATIC_LEGEND_HEIGHT_RATIO_DEFAULT,
  STATIC_LEGEND_HEIGHT_RATIO_MAXIMUM,
  STATIC_LEGEND_HEIGHT_RATIO_MINIMUM,
  STATIC_LEGEND_HEIGHT_RATIO_STEP,
  STATIC_LEGEND_HIDE_DEFAULT,
} from 'src/visualization/constants'

// Metrics
import {event} from 'src/cloud/utils/reporting'

// Styles
import 'src/visualization/components/internal/StaticLegend.scss'

const eventPrefix = 'visualization.customize.staticlegend'

interface Props extends VisualizationOptionProps {
  properties:
    | BandViewProperties
    | XYViewProperties
    | LinePlusSingleStatProperties
}

const StaticLegend: FC<Props> = ({properties, update}) => {
  const {
    staticLegend = {
      hide: STATIC_LEGEND_HIDE_DEFAULT,
    } as StaticLegend,
  } = properties
  const {valueAxis} = staticLegend
  const {heightRatio = STATIC_LEGEND_HEIGHT_RATIO_DEFAULT, hide} = staticLegend
  const [showOptions, setShowOptions] = useState<boolean>(!hide)

  if (!isFlagEnabled('staticLegend')) {
    return null
  }

  const handleChooseHide = () => {
    setShowOptions(false)
    update({
      staticLegend: {
        ...staticLegend,
        hide: true,
      },
    })
    event(`${eventPrefix}.hide`, {
      type: properties.type,
    })
  }

  const handleChooseShow = () => {
    setShowOptions(true)
    update({
      staticLegend: {
        ...staticLegend,
        hide: false,
      },
    })
    event(`${eventPrefix}.show`, {
      type: properties.type,
    })
  }

  const handleSetHeightRatio = (e: ChangeEvent<HTMLInputElement>): void => {
    const value = convertUserInputToNumOrNaN(e)

    if (isNaN(value) || value < STATIC_LEGEND_HEIGHT_RATIO_MINIMUM) {
      update({
        staticLegend: {
          ...staticLegend,
          heightRatio: STATIC_LEGEND_HEIGHT_RATIO_MINIMUM,
        },
      })
      event(`${eventPrefix}.heightRatio`, {
        type: properties.type,
        heightRatio: STATIC_LEGEND_HEIGHT_RATIO_MINIMUM,
      })
    } else {
      update({
        staticLegend: {...staticLegend, heightRatio: value},
      })
      event(`${eventPrefix}.heightRatio`, {
        type: properties.type,
        heightRatio: value,
      })
    }
  }

  const convertHeightRatioToPercentage = (heightRatio: number): string =>
    `Height: ${(heightRatio * 100).toFixed(0)}%`

  const handleSetValueAxis = (valueAxis: string): void => {
    update({
      staticLegend: {...staticLegend, valueAxis},
    })
  }

  return (
    <FlexBox
      direction={FlexDirection.Column}
      margin={ComponentSize.Large}
      alignItems={AlignItems.FlexStart}
      className="static-legend-options"
      testID="static-legend-options"
    >
      <Form.Element label="Static Legend" className="static-legend-options">
        <Grid>
          <Grid.Row>
            <Grid.Column widthXS={Columns.Twelve}>
              <SelectGroup shape={ButtonShape.StretchToFit}>
                <SelectGroup.Option
                  name="static-legend-hide"
                  id="radio_static_legend_hide"
                  titleText="Hide"
                  active={!showOptions}
                  onClick={handleChooseHide}
                  value="Auto"
                >
                  Hide
                </SelectGroup.Option>
                <SelectGroup.Option
                  name="static-legend-show"
                  id="radio_static_legend_show"
                  titleText="Show"
                  active={showOptions}
                  onClick={handleChooseShow}
                  value="Custom"
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
                className="static-legend-options--show"
              >
                <Toggle
                  tabIndex={1}
                  value="y"
                  id="latest-y-axis"
                  className="latest-y-axis"
                  name="valueAxis"
                  checked={valueAxis !== 'x'}
                  onChange={handleSetValueAxis}
                  type={InputToggleType.Radio}
                  size={ComponentSize.ExtraSmall}
                  appearance={Appearance.Outline}
                >
                  <InputLabel
                    active={valueAxis !== 'x'}
                    htmlFor="latest-y-axis"
                  >
                    Latest Y Axis
                  </InputLabel>
                </Toggle>
                <Toggle
                  tabIndex={2}
                  value="x"
                  id="latest-x-axis"
                  className="latest-x-axis"
                  name="valueAxis"
                  checked={valueAxis === 'x'}
                  onChange={handleSetValueAxis}
                  type={InputToggleType.Radio}
                  size={ComponentSize.ExtraSmall}
                  appearance={Appearance.Outline}
                >
                  <InputLabel
                    active={valueAxis === 'x'}
                    htmlFor="latest-x-axis"
                  >
                    Latest X Axis
                  </InputLabel>
                </Toggle>
                <Form.Element
                  className="static-legend-height-slider"
                  label={convertHeightRatioToPercentage(heightRatio)}
                >
                  <RangeSlider
                    max={STATIC_LEGEND_HEIGHT_RATIO_MAXIMUM}
                    min={STATIC_LEGEND_HEIGHT_RATIO_MINIMUM}
                    step={STATIC_LEGEND_HEIGHT_RATIO_STEP}
                    value={heightRatio}
                    onChange={handleSetHeightRatio}
                    hideLabels={true}
                    testID="static-legend-height-slider"
                  />
                </Form.Element>
              </Grid.Column>
            </Grid.Row>
          )}
        </Grid>
      </Form.Element>
    </FlexBox>
  )
}

export default StaticLegend
