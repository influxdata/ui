// Libraries
import React, {FC} from 'react'

// Components
import {ValueTickInput} from 'src/shared/components/axisTicks/ValueTickInput'
import {Grid} from '@influxdata/clockface'

interface ValueTicksOptionsProps {
  axisName: string
  tickOptions: string[]
  totalTicks: number | string
  tickStart: number | string
  tickStep: number | string
  setOptions: (optionName: string, arg: string[] | number) => void
}

export const ValueTicksOptions: FC<ValueTicksOptionsProps> = props => {
  const {
    axisName,
    tickOptions,
    totalTicks,
    tickStart,
    tickStep,
    setOptions,
  } = props
  return (
    <>
      <Grid.Row className="tick-generator-input--custom">
        <ValueTickInput
          axisName={axisName}
          tickOptions={tickOptions}
          initialTickOptionValue={totalTicks}
          label="Total Ticks"
          setOptions={setOptions}
        />
        <ValueTickInput
          axisName={axisName}
          tickOptions={tickOptions}
          initialTickOptionValue={tickStart}
          label="Tick Start"
          setOptions={setOptions}
        />
        <ValueTickInput
          axisName={axisName}
          tickOptions={tickOptions}
          initialTickOptionValue={tickStep}
          label="Tick Step"
          setOptions={setOptions}
        />
      </Grid.Row>
    </>
  )
}
