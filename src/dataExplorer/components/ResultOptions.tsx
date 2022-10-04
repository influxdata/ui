import React from 'react'

// Components
import {Accordion} from '@influxdata/clockface'

// Style
import './Sidebar.scss'

const ResultOptions = () => {
  console.log('test result options')
  return (
    <Accordion className="result-options" expanded={true}>
      <Accordion.AccordionHeader className="result-options--header">
        Result Options
      </Accordion.AccordionHeader>
      items
    </Accordion>
  )
}

export {ResultOptions}
