import React, {FC} from 'react'

// Components
import {Accordion} from '@influxdata/clockface'
import SelectorTitle from './SelectorTitle'

const TagKeysSelector: FC = () => {
  const tags = [
    {key: 'station_id', value: []},
    {key: 'station_owner', value: ['COMPS']},
  ]
  const list = tags.map(tag => (
    <div key={tag.key} className="tag-keys-selector--list-item">
      {tag.key}
    </div>
  ))
  return (
    <Accordion className="tag-keys-selector">
      <Accordion.AccordionHeader className="tag-keys-selector--header">
        <SelectorTitle title="Tag Keys" />
      </Accordion.AccordionHeader>
      {list}
      <div className="fields-selector--list-item">Load More</div>
    </Accordion>
  )
}

export default TagKeysSelector
