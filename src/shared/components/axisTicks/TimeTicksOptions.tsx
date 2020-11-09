// Libraries
import React, {FC} from 'react'

// Components
import {ValueTickInput} from 'src/shared/components/axisTicks/ValueTickInput'
import {TimeTickInput} from 'src/shared/components/axisTicks/TimeTickInput'
import {Grid} from '@influxdata/clockface'

interface TimeTicksOptionsProps {
  axisName: string
  tickOptions: string[]
  totalTicks: number | string
  tickStart: number | string
  tickStep: number | string
  setOptions: (optionName: string, arg: string[] | number) => void
}

export const TimeTicksOptions: FC<TimeTicksOptionsProps> = props => {
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
        <TimeTickInput
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
          placeholder="milliseconds"
          setOptions={setOptions}
        />
      </Grid.Row>
    </>
  )
}
