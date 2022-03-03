// Libraries
import React, {FC, useContext} from 'react'
import {
  ComponentStatus,
  Form,
  FlexBox,
  Input,
  InputType,
  ComponentSize,
} from '@influxdata/clockface'

// Types
import {PipeProp} from 'src/types/flows'

import {PipeContext} from 'src/flows/context/pipe'

import {SafeBlankLink} from 'src/utils/SafeBlankLink'

import './style.scss'

const Time: FC<PipeProp> = ({Context}) => {
  const {data, update} = useContext(PipeContext)

  let startError = ''
  let stopError = ''

  if (!data.start) {
    startError = 'Required'
  } else if (
    !/^-(?:(\d+(ns|us|µs|ms|s|m|h|d|w|mo|y){1}))+$/g.test(data.start) &&
    !/^([0-9]{4})-([0-9]{2})-([0-9]{2})([Tt]([0-9]{2}):([0-9]{2}):([0-9]{2})(\\.[0-9]+)?)?(([Zz]|([+-])([0-9]{2}):([0-9]{2})))?/g.test(
      data.start
    )
  ) {
    startError = 'Invalid Time'
  }

  if (!data.stop) {
    stopError = 'Required'
  } else if (
    !/^now\(\)$/g.test(data.stop) &&
    !/^-(?:(\d+(ns|us|µs|ms|s|m|h|d|w|mo|y){1}))+$/g.test(data.stop) &&
    !/^([0-9]{4})-([0-9]{2})-([0-9]{2})([Tt]([0-9]{2}):([0-9]{2}):([0-9]{2})(\\.[0-9]+)?)?(([Zz]|([+-])([0-9]{2}):([0-9]{2})))?/g.test(
      data.stop
    )
  ) {
    stopError = 'Invalid Time'
  }

  const updateStart = evt => {
    update({
      start: evt.target.value,
    })
  }

  const updateStop = evt => {
    update({
      stop: evt.target.value,
    })
  }

  return (
    <Context>
      <FlexBox margin={ComponentSize.Medium}>
        <FlexBox.Child
          basis={200}
          grow={0}
          shrink={0}
          className="flow-panel-time--header"
        >
          <h5>Set a time frame</h5>
          <p>
            <SafeBlankLink href="https://docs.influxdata.com/flux/v0.x/spec/lexical-elements/#duration-literals">
              durations
            </SafeBlankLink>{' '}
            and{' '}
            <SafeBlankLink href="https://docs.influxdata.com/flux/v0.x/spec/lexical-elements/#date-and-time-literals">
              dates
            </SafeBlankLink>{' '}
            are valid
          </p>
        </FlexBox.Child>
        <FlexBox.Child grow={1} shrink={1} style={{alignSelf: 'start'}}>
          <Form.Element label="Start" required={true} errorMessage={startError}>
            <Input
              name="start"
              type={InputType.Text}
              placeholder="ex: -1h00s"
              value={data.start}
              onChange={updateStart}
              status={
                startError ? ComponentStatus.Error : ComponentStatus.Default
              }
              size={ComponentSize.Medium}
            />
          </Form.Element>
        </FlexBox.Child>

        <FlexBox.Child grow={1} shrink={1} style={{alignSelf: 'start'}}>
          <Form.Element label="End" required={true} errorMessage={stopError}>
            <Input
              name="end"
              type={InputType.Text}
              placeholder="ex: now()"
              value={data.stop}
              onChange={updateStop}
              status={
                stopError ? ComponentStatus.Error : ComponentStatus.Default
              }
              size={ComponentSize.Medium}
            />
          </Form.Element>
        </FlexBox.Child>
      </FlexBox>
    </Context>
  )
}

export default Time
