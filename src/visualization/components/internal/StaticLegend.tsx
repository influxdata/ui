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
  STATIC_LEGEND_HEIGHT_RATIO_MAXIMUM,
  STATIC_LEGEND_HEIGHT_RATIO_MINIMUM,
  STATIC_LEGEND_HEIGHT_RATIO_STEP,
} from 'src/visualization/constants'

interface Props extends VisualizationOptionProps {
  properties:
    | BandViewProperties
    | XYViewProperties
    | LinePlusSingleStatProperties
}

const StaticLegend: FC<Props> = ({properties, update}) => {
  const {staticLegend} = properties
  const {valueAxis} = staticLegend
  const {heightRatio, hide} = staticLegend ? staticLegend : ({} as StaticLegend)
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
  }

  const handleChooseShow = () => {
    setShowOptions(true)
    update({
      staticLegend: {
        ...staticLegend,
        hide: false,
      },
    })
  }

  const handleSetHeightRatio = (event: ChangeEvent<HTMLInputElement>): void => {
    const value = convertUserInputToNumOrNaN(event)

    if (isNaN(value) || value < STATIC_LEGEND_HEIGHT_RATIO_MINIMUM) {
      update({
        staticLegend: {
          ...staticLegend,
          heightRatio: STATIC_LEGEND_HEIGHT_RATIO_MINIMUM,
        },
      })
    } else {
      update({
        staticLegend: {...staticLegend, heightRatio: value},
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
      style={{marginTop: 18}}
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
                  name="valueAxis"
                  checked={valueAxis !== 'x'}
                  onChange={handleSetValueAxis}
                  type={InputToggleType.Radio}
                  size={ComponentSize.ExtraSmall}
                  appearance={Appearance.Outline}
                  style={{marginTop: '1em', marginBottom: '0.5em'}}
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
                  name="valueAxis"
                  checked={valueAxis === 'x'}
                  onChange={handleSetValueAxis}
                  type={InputToggleType.Radio}
                  size={ComponentSize.ExtraSmall}
                  appearance={Appearance.Outline}
                  style={{marginBottom: '1em'}}
                >
                  <InputLabel
                    active={valueAxis === 'x'}
                    htmlFor="latest-x-axis"
                  >
                    Latest X Axis
                  </InputLabel>
                </Toggle>
                <Form.Element
                  label={convertHeightRatioToPercentage(heightRatio)}
                >
                  <RangeSlider
                    max={STATIC_LEGEND_HEIGHT_RATIO_MAXIMUM}
                    min={STATIC_LEGEND_HEIGHT_RATIO_MINIMUM}
                    step={STATIC_LEGEND_HEIGHT_RATIO_STEP}
                    value={heightRatio}
                    onChange={handleSetHeightRatio}
                    hideLabels={true}
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
