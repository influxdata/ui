// Libraries
import React, {FC, useState} from 'react'
import {connect, ConnectedProps} from 'react-redux'
import {get} from 'lodash'

// Utils
import {isFlagEnabled} from 'src/shared/utils/featureFlag'
import {getActiveTimeMachine} from 'src/timeMachine/selectors'
import {capitalize} from 'lodash'

// Components
import {ValueTicksOptions} from 'src/shared/components/axisTicks/ValueTicksOptions'
import {TimeTicksOptions} from 'src/shared/components/axisTicks/TimeTicksOptions'
import {Columns, Form, Grid, SelectGroup} from '@influxdata/clockface'

// Types
import {AppState} from 'src/types'
import {ButtonShape} from '@influxdata/clockface'

const getGenerateAxisTicksOptionsNames = (axisName: string) => [
  `generate${axisName.toUpperCase()}AxisTicks`,
  `${axisName.toLowerCase()}TotalTicks`,
  `${axisName.toLowerCase()}TickStart`,
  `${axisName.toLowerCase()}TickStep`,
]

interface AxisTicksGeneratorProps {
  axisName: string
  columnType: string
  onSetGenerateAxisTicks: (generateAxisTicks: string[]) => void
  onSetTotalTicks: (totalTicks: number) => void
  onSetTickStart: (tickStart: number) => void
  onSetTickStep: (tickStep: number) => void
  label?: string
}

type ReduxProps = ConnectedProps<typeof connector>
type Props = AxisTicksGeneratorProps & ReduxProps

const AxisTicksGenerator: FC<Props> = props => {
  const {
    axisName,
    columnType,
    generateAxisTicks,
    label = 'Tick Generator',
    onSetGenerateAxisTicks,
    onSetTotalTicks,
    onSetTickStart,
    onSetTickStep,
    totalTicks,
    tickStart,
    tickStep,
  } = props

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
    onSetGenerateAxisTicks([])
  }

  const handleChooseCustom = () => {
    setShouldShowInputs(true)
  }

  const onSetTicksGeneratorOptions = (
    optionName: string,
    arg: string[] | number
  ) => {
    switch (optionName) {
      case 'GenerateAxisTicks': {
        onSetGenerateAxisTicks(arg as string[])
        return
      }

      case 'TotalTicks': {
        onSetTotalTicks(arg as number)
        return
      }

      case 'TickStart': {
        onSetTickStart(arg as number)
        return
      }

      case 'TickStep': {
        onSetTickStep(arg as number)
        return
      }
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
      {shouldShowInputs &&
        (isTimeColumn ? (
          <TimeTicksOptions
            axisName={axisName}
            tickOptions={generateAxisTicks}
            totalTicks={totalTicks}
            tickStart={tickStart}
            tickStep={tickStep}
            setOptions={onSetTicksGeneratorOptions}
          />
        ) : (
          <ValueTicksOptions
            axisName={axisName}
            tickOptions={generateAxisTicks}
            totalTicks={totalTicks}
            tickStart={tickStart}
            tickStep={tickStep}
            setOptions={onSetTicksGeneratorOptions}
          />
        ))}
    </Form.Element>
  )
}

const mstp = (state: AppState, ownProps: AxisTicksGeneratorProps) => {
  const {axisName} = ownProps
  const timeMachine = getActiveTimeMachine(state)
  const properties = get(timeMachine, 'view.properties', {})

  const generateAxisTicks =
    properties[`generate${capitalize(axisName)}AxisTicks`]
  const totalTicks = properties[`${axisName}TotalTicks`]
  const tickStart = properties[`${axisName}TickStart`]
  const tickStep = properties[`${axisName}TickStep`]

  let hasTotalTicks =
    typeof totalTicks === 'number' && totalTicks === totalTicks
  let hasTickStart = typeof tickStart === 'number' && tickStart === tickStart
  let hasTickStep = typeof tickStep === 'number' && tickStep === tickStep

  if (Array.isArray(generateAxisTicks)) {
    generateAxisTicks.forEach(tickOption => {
      if (tickOption === `${axisName.toLowerCase()}TotalTicks`) {
        hasTotalTicks = true
      }
      if (tickOption === `${axisName.toLowerCase()}TickStart`) {
        hasTickStart = true
      }
      if (tickOption === `${axisName.toLowerCase()}TickStep`) {
        hasTickStep = true
      }
    })
  }

  return {
    generateAxisTicks: Array.isArray(generateAxisTicks)
      ? generateAxisTicks
      : [],
    totalTicks: hasTotalTicks ? totalTicks : '',
    tickStart: hasTickStart ? tickStart : '',
    tickStep: hasTickStep ? tickStep : '',
  }
}

const connector = connect(mstp)
export default connector(AxisTicksGenerator)
