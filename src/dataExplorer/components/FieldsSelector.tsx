import React, {FC} from 'react'

// Components
import {Accordion} from '@influxdata/clockface'
import SelectorTitle from 'src/dataExplorer/components/SelectorTitle'

// Syles
import './Schema.scss'

const FieldsSelector: FC = () => {
  const fields = ['air_temp_degc', 'avg_wave_period_sec', 'dewpoint_temp_degc']
  const list = fields.map(field => (
    <div key={field} className="fields-selector--list-item">
      {field}
    </div>
  ))
  return (
    <Accordion className="fields-selector">
      <Accordion.AccordionHeader className="fields-selector--header">
        <SelectorTitle title="Fields" />
      </Accordion.AccordionHeader>
      {list}
      <div className="fields-selector--list-item">Load More</div>
    </Accordion>
  )
}

export default FieldsSelector
