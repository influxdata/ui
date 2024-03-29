import React, {FC, useContext} from 'react'
import {SlideToggle, InputLabel} from '@influxdata/clockface'
import {FlowContext} from 'src/flows/context/flow.current'

// Utils
import {event} from 'src/cloud/utils/reporting'

const PresentationMode: FC = () => {
  const {flow, updateOther} = useContext(FlowContext)

  const handleChange = () => {
    event('Presentation Mode Toggled', {
      state: !flow.readOnly ? 'edit' : 'presentation',
    })
    updateOther({readOnly: !flow.readOnly})
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
