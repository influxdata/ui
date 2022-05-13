import React, {FC} from 'react'

// Components
import {Accordion} from '@influxdata/clockface'
import SelectorTitle from 'src/dataExplorer/components/SelectorTitle'

// Syles
import './Schema.scss'

const FieldsSelector: FC = () => {
  const fields = ['air_temp_degc', 'avg_wave_period_sec', 'dewpoint_temp_degc']

  let list: JSX.Element | JSX.Element[] = (
    <div className="fields-selector--list-item">No Fields Found</div>
  )

  if (fields.length) {
    list = fields.map(field => (
      <div key={field} className="fields-selector--list-item">
        {field}
      </div>
    ))
    list.push(
      <div key="load-more" className="fields-selector--list-item">
        Load More
      </div>
    )
  }

  return (
    <Accordion className="fields-selector">
      <Accordion.AccordionHeader className="fields-selector--header">
        <SelectorTitle title="Fields" />
      </Accordion.AccordionHeader>
      {list}
    </Accordion>
  )
}

export default FieldsSelector
