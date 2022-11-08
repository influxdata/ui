// Libraries
import React, {FC, useCallback, useRef, useState} from 'react'
import {debounce} from 'lodash'

// Utils
import {convertUserInputToNumOrNaN} from 'src/shared/utils/convertUserInput'

// Components
import {
  Appearance,
  ButtonShape,
  Columns,
  ComponentSize,
  Form,
  Grid,
  InputLabel,
  InputToggleType,
  RangeSlider,
  SelectGroup,
  Toggle,
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
  LinePlusSingleStatProperties,
  StaticLegend as StaticLegendType,
  XYViewProperties,
} from 'src/types'

// Constants
import {
  LEGEND_COLORIZE_ROWS_DEFAULT,
  LEGEND_OPACITY_DEFAULT,
  LEGEND_OPACITY_MAXIMUM,
  LEGEND_OPACITY_MINIMUM,
  LEGEND_ORIENTATION_THRESHOLD_DEFAULT,
  LEGEND_ORIENTATION_THRESHOLD_HORIZONTAL,
  LEGEND_ORIENTATION_THRESHOLD_VERTICAL,
  LegendDisplayStatus,
  STATIC_LEGEND_HEIGHT_RATIO_MAXIMUM,
  STATIC_LEGEND_HEIGHT_RATIO_MINIMUM,
  STATIC_LEGEND_HEIGHT_RATIO_NOT_SET,
  STATIC_LEGEND_HEIGHT_RATIO_STEP,
  STATIC_LEGEND_SHOW_DEFAULT,
  STATIC_LEGEND_WIDTH_RATIO_DEFAULT,
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
      colorizeRows: LEGEND_COLORIZE_ROWS_DEFAULT,
      heightRatio: STATIC_LEGEND_HEIGHT_RATIO_NOT_SET,
      opacity: LEGEND_OPACITY_DEFAULT,
      orientationThreshold: LEGEND_ORIENTATION_THRESHOLD_DEFAULT,
      show: STATIC_LEGEND_SHOW_DEFAULT,
      widthRatio: STATIC_LEGEND_WIDTH_RATIO_DEFAULT,
    } as StaticLegendType,
  } = properties
  const {valueAxis} = staticLegend
  const {
    colorizeRows = false, // undefined is considered false because of omitempty
    heightRatio: defaultHeightRatio = STATIC_LEGEND_HEIGHT_RATIO_NOT_SET,
    opacity = LEGEND_OPACITY_DEFAULT,
    orientationThreshold = LEGEND_ORIENTATION_THRESHOLD_DEFAULT,
    show,
  } = staticLegend
  const [showOptions, setShowOptions] = useState<boolean>(show)
  const [heightRatio, setHeightRatio] = useState(defaultHeightRatio)
  const heightRatioRef = useRef<number>(null)
  heightRatioRef.current = heightRatio

  React.useEffect(() => {
    if (
      heightRatio === STATIC_LEGEND_HEIGHT_RATIO_NOT_SET &&
      heightRatio !== defaultHeightRatio
    ) {
      setHeightRatio(defaultHeightRatio)
    }
  }, [defaultHeightRatio, heightRatio])

  const handleChooseStaticLegend = (value: string) => {
    setShowOptions(value === LegendDisplayStatus.SHOW)
    update({
      staticLegend: {
        ...staticLegend,
        show: value === LegendDisplayStatus.SHOW,
      },
    })
    event(`${eventPrefix}.${value}`, {
      type: properties.type,
    })
  }

  const updateHeightRatio = (heightRatio: number): void => {
    if (
      isNaN(heightRatio) ||
      heightRatio < STATIC_LEGEND_HEIGHT_RATIO_MINIMUM
    ) {
      update({
        staticLegend: {
          ...staticLegend,
          heightRatio: STATIC_LEGEND_HEIGHT_RATIO_NOT_SET,
        },
      })
      event(`${eventPrefix}.heightRatio`, {
        type: properties.type,
        heightRatio: STATIC_LEGEND_HEIGHT_RATIO_NOT_SET,
      })
    } else {
      update({
        staticLegend: {...staticLegend, heightRatio, show: true},
      })
      event(`${eventPrefix}.heightRatio`, {
        type: properties.type,
        heightRatio: heightRatioRef.current,
      })
    }
  }

  const updateHeightRatioDebounced = useCallback(
    debounce(updateHeightRatio, 250),
    []
  )

  const convertHeightRatioToPercentage = (heightRatio: number): string =>
    `Height: ${(heightRatio * 100).toFixed(0)}%`

  const handleSetValueAxis = (valueAxis: string): void => {
    update({
      staticLegend: {...staticLegend, valueAxis},
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
      staticLegend: {...staticLegend, orientationThreshold: validThreshold},
    })
    // eventing is done by <OrientationToggle> because
    // UI's definition of orientation is either horizontal or vertical
    // which is less intricate than Giraffe's
  }

  const setOpacity = (opacity: number): void => {
    if (isNaN(opacity) || opacity < LEGEND_OPACITY_MINIMUM) {
      update({
        staticLegend: {...staticLegend, opacity: LEGEND_OPACITY_MAXIMUM},
      })
      event(`${eventPrefix}.opacity`, {
        type: properties.type,
        opacity: LEGEND_OPACITY_MAXIMUM,
      })
    } else {
      update({
        staticLegend: {
          ...staticLegend,
          opacity,
          heightRatio: heightRatioRef.current,
        },
      })
      event(`${eventPrefix}.opacity`, {
        type: properties.type,
        opacity,
      })
    }
  }

  const handleSetColorization = (): void => {
    update({
      staticLegend: {
        ...staticLegend,
        colorizeRows: !colorizeRows,
      },
    })
    event(`${eventPrefix}.colorizeRows.${!colorizeRows}`, {
      type: properties.type,
    })
  }

  return (
    <Form.Element
      label="Display Static Legend"
      className="static-legend-options"
      testID="static-legend-options"
    >
      <Grid>
        <Grid.Row>
          <Grid.Column widthXS={Columns.Twelve}>
            <SelectGroup shape={ButtonShape.StretchToFit}>
              <SelectGroup.Option
                name="static-legend-hide"
                id="radio_static_legend_hide"
                titleText="Hide"
                active={!showOptions}
                onClick={handleChooseStaticLegend}
                value={LegendDisplayStatus.HIDE}
              >
                Hide
              </SelectGroup.Option>
              <SelectGroup.Option
                name="static-legend-show"
                id="radio_static_legend_show"
                titleText="Show"
                active={showOptions}
                onClick={handleChooseStaticLegend}
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
              className="static-legend-options--show"
            >
              <OrientationToggle
                eventName={`${eventPrefix}.orientation`}
                graphType={properties.type}
                legendOrientation={orientationThreshold}
                parentName="static-legend"
                handleSetOrientation={handleSetOrientation}
                testID="static-legend-orientation-toggle"
              />
              <OpacitySlider
                legendOpacity={opacity}
                setOpacity={setOpacity}
                testID="static-legend-opacity-slider"
              />
              <ColorizeRowsToggle
                legendColorizeRows={colorizeRows}
                handleSetColorization={handleSetColorization}
                testID="static-legend-colorize-rows-toggle"
              />
              <Form.Element label="Displayed Value">
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
              </Form.Element>
              <Form.Element
                className="static-legend-height-slider"
                label={convertHeightRatioToPercentage(heightRatio)}
              >
                <RangeSlider
                  max={STATIC_LEGEND_HEIGHT_RATIO_MAXIMUM}
                  min={STATIC_LEGEND_HEIGHT_RATIO_MINIMUM}
                  step={STATIC_LEGEND_HEIGHT_RATIO_STEP}
                  value={heightRatio}
                  onChange={evt => {
                    const heightRatio = convertUserInputToNumOrNaN(evt)
                    setHeightRatio(heightRatio)
                    updateHeightRatioDebounced(heightRatio)
                  }}
                  hideLabels={true}
                  testID="static-legend-height-slider"
                />
              </Form.Element>
            </Grid.Column>
          </Grid.Row>
        )}
      </Grid>
    </Form.Element>
  )
}

export default StaticLegend
