// Libraries
import React, {ChangeEvent, FC, useContext, useMemo} from 'react'

// Components
import {
  ComponentSize,
  Input,
  InputType,
  FlexBox,
  FlexDirection,
  TextBlock,
} from '@influxdata/clockface'
import {PipeContext} from 'src/flows/context/pipe'
import {event} from 'src/cloud/utils/reporting'
import {
  COMMON_THRESHOLD_TYPES,
  ErrorThreshold,
  ThresholdFormat,
} from 'src/flows/pipes/Visualization/threshold'
import './ErrorThresholds.scss'

type Props = {
  threshold: ErrorThreshold
  index: number
}

const ThresholdEntryColumn: FC<Props> = ({threshold, index}) => {
  const {data, update} = useContext(PipeContext)

  const errorThresholds = useMemo(
    () => data?.errorThresholds ?? [],
    [data?.errorThresholds]
  )

  const updateMin = (event: ChangeEvent<HTMLInputElement>, index: number) => {
    const threshold = errorThresholds.find((_, i) => index === i)

    if (threshold) {
      threshold.min = Number(event.target.value)
    }

    update({errorThresholds})
  }

  const updateMax = (event: ChangeEvent<HTMLInputElement>, index: number) => {
    const threshold = errorThresholds.find((_, i) => index === i)

    if (threshold) {
      threshold.max = Number(event.target.value)
    }

    update({errorThresholds})
  }

  const updateValue = (
    changeEvent: ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    event('Alert Panel (Notebooks) - Threshold Value Entered')
    const threshold = errorThresholds.find((_, i) => index === i)
    if (!threshold) {
      return
    }

    threshold.value = changeEvent.target.value

    update({errorThresholds})
  }

  let body = (
    <Input
      type={InputType.Text}
      placeholder="value"
      value={threshold.value}
      onChange={event => updateValue(event, index)}
      size={ComponentSize.Medium}
    />
  )

  if (
    COMMON_THRESHOLD_TYPES[threshold?.type]?.format === ThresholdFormat.Range
  ) {
    body = (
      <>
        <Input
          type={InputType.Number}
          placeholder="min"
          value={threshold.min}
          onChange={event => updateMin(event, index)}
          size={ComponentSize.Medium}
        />
        <TextBlock
          testID="is-value-text-block"
          text="to"
          style={{background: 'transparent'}}
        />
        <Input
          type={InputType.Number}
          placeholder="max"
          value={threshold.max}
          onChange={event => updateMax(event, index)}
          size={ComponentSize.Medium}
        />
      </>
    )
  }

  return (
    <FlexBox
      direction={FlexDirection.Row}
      margin={ComponentSize.Small}
      className="threshold-entry--container"
    >
      {body}
    </FlexBox>
  )
}

export default ThresholdEntryColumn
