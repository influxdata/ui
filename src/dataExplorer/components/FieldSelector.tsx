import React, {FC} from 'react'

// Components
import {Accordion} from '@influxdata/clockface'
import SelectorTitle from 'src/dataExplorer/components/SelectorTitle'

// Syles
import './Schema.scss'

const FieldSelector: FC = () => {
  const fields = ['air_temp_degc', 'avg_wave_period_sec', 'dewpoint_temp_degc']

  let list: JSX.Element | JSX.Element[] = (
    <div className="field-selector--list-item">No Fields Found</div>
  )

  if (fields.length) {
    list = fields.map(field => (
      <div key={field} className="field-selector--list-item">
        {field}
      </div>
    ))
    // TODO: check length of fields to load more
    // list.push(
    //   <div key="load-more" className="field-selector--list-item">
    //     Load More
    //   </div>
    // )
  }

  return (
    <Accordion className="field-selector" expanded={true}>
      <Accordion.AccordionHeader className="field-selector--header">
        <SelectorTitle title="Fields" info="Test info" />
      </Accordion.AccordionHeader>
      {list}
    </Accordion>
  )
}

export default FieldSelector
