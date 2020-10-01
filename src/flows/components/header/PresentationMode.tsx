import React, {FC, useContext} from 'react'
import {SlideToggle, InputLabel} from '@influxdata/clockface'
import {FlowContext} from 'src/flows/context/flow.current'

const PresentationMode: FC = () => {
  const {flow, update} = useContext(FlowContext)

  const handleChange = () => {
    update({readOnly: !flow.readOnly})
  }

  const toggleClassName = `flows-presentationmode-${
    !!flow.readOnly ? 'disable' : 'enable'
  }`

  return (
    <>
      <SlideToggle
        active={flow.readOnly}
        onChange={handleChange}
        className={toggleClassName}
      />
      <InputLabel>Presentation</InputLabel>
    </>
  )
}

export default PresentationMode
