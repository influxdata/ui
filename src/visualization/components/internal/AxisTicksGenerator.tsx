// Libraries
import React, {FC, useState} from 'react'

// Utils
import {isFlagEnabled} from 'src/shared/utils/featureFlag'

// Components
import {ValueTickInput} from 'src/visualization/components/internal/ValueTickInput'
import {TimeTickInput} from 'src/visualization/components/internal/TimeTickInput'
import {Columns, Form, Grid, SelectGroup} from '@influxdata/clockface'

// Types
import {ButtonShape} from '@influxdata/clockface'
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

const getGenerateAxisTicksOptionsNames = (axisName: string) => [
  `generate${axisName.toUpperCase()}AxisTicks`,
  `${axisName.toLowerCase()}TotalTicks`,
  `${axisName.toLowerCase()}TickStart`,
  `${axisName.toLowerCase()}TickStep`,
]

interface Props extends VisualizationOptionProps {
  properties:
    | BandViewProperties
    | XYViewProperties
    | LinePlusSingleStatProperties
    | HeatmapViewProperties
    | HistogramViewProperties
    | MosaicViewProperties
    | ScatterViewProperties
  axisName: string
  columnType: string
  label?: string
}

const AxisTicksGenerator: FC<Props> = ({
  axisName,
  columnType,
  label = 'Tick Generator',

  properties,
  update,
}) => {
  const generateAxisTicks =
    properties[`generate${axisName.toUpperCase()}AxisTicks`] || []

  const {hasTotalTicks, hasTickStart, hasTickStep} = generateAxisTicks.reduce(
    (acc, curr) => {
      if (curr === `${axisName.toLowerCase()}TotalTicks`) {
        acc.hasTotalTicks = true
      }
      if (curr === `${axisName.toLowerCase()}TickStart`) {
        acc.hasTickStart = true
      }
      if (curr === `${axisName.toLowerCase()}TickStep`) {
        acc.hasTickStep = true
      }

      return acc
    },
    {hasTotalTicks: false, hasTickStart: false, hasTickStep: false}
  )

  const totalTicks = hasTotalTicks ? properties[`${axisName}TotalTicks`] : ''
  const tickStart = hasTickStart ? properties[`${axisName}TickStart`] : ''
  const tickStep = hasTickStep ? properties[`${axisName}TickStep`] : ''

  const [shouldShowInputs, setShouldShowInputs] = useState(
    generateAxisTicks.reduce((total, optionName) => {
      getGenerateAxisTicksOptionsNames(axisName).forEach(axisTickOption => {
        if (axisTickOption === optionName) {
          total += 1
        }
      })
      return total
    }, 0) > 0
  )

  if (!isFlagEnabled('axisTicksGenerator')) {
    return null
  }

  const isTimeColumn = columnType === '_time' ? true : false

  const handleChooseAuto = () => {
    setShouldShowInputs(false)
    update({
      [`generate${axisName.toUpperCase()}AxisTicks`]: [],
    })
  }

  const handleChooseCustom = () => {
    setShouldShowInputs(true)
  }

  let options

  if (shouldShowInputs) {
    if (isTimeColumn) {
      options = (
        <Grid.Row className="tick-generator-input--custom">
          <ValueTickInput
            axisName={axisName}
            tickOptions={generateAxisTicks}
            initialTickOptionValue={totalTicks}
            label="Total Tick Marks"
            update={update}
          />
          <TimeTickInput
            axisName={axisName}
            tickOptions={generateAxisTicks}
            initialTickOptionValue={tickStart}
            label="Start Tick Marks At"
            update={update}
          />
          <ValueTickInput
            axisName={axisName}
            tickOptions={generateAxisTicks}
            initialTickOptionValue={tickStep}
            label="Tick Mark Interval"
            placeholder="milliseconds"
            update={update}
          />
        </Grid.Row>
      )
    } else {
      options = (
        <Grid.Row className="tick-generator-input--custom">
          <ValueTickInput
            axisName={axisName}
            tickOptions={generateAxisTicks}
            initialTickOptionValue={totalTicks}
            label="Total Tick Marks"
            update={update}
          />
          <ValueTickInput
            axisName={axisName}
            tickOptions={generateAxisTicks}
            initialTickOptionValue={tickStart}
            label="Start Tick Marks At"
            update={update}
          />
          <ValueTickInput
            axisName={axisName}
            tickOptions={generateAxisTicks}
            initialTickOptionValue={tickStep}
            label="Tick Mark Interval"
            update={update}
          />
        </Grid.Row>
      )
    }
  }

  return (
    <Form.Element label={label} className="tick-generator-input">
      <Grid.Row>
        <Grid.Column widthXS={Columns.Twelve}>
          <SelectGroup shape={ButtonShape.StretchToFit}>
            <SelectGroup.Option
              name="tick-generator"
              id="radio_auto"
              titleText="Auto"
              active={!shouldShowInputs}
              onClick={handleChooseAuto}
              value="Auto"
            >
              Auto
            </SelectGroup.Option>
            <SelectGroup.Option
              name="tick-generator"
              id="radio_custom"
              titleText="Custom"
              active={shouldShowInputs}
              onClick={handleChooseCustom}
              value="Custom"
            >
              Custom
            </SelectGroup.Option>
          </SelectGroup>
        </Grid.Column>
      </Grid.Row>
      {options}
    </Form.Element>
  )
}

export default AxisTicksGenerator
