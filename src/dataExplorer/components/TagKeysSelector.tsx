import React, {FC} from 'react'

// Components
import {Accordion} from '@influxdata/clockface'
import SelectorTitle from 'src/dataExplorer/components/SelectorTitle'

const TagKeysSelector: FC = () => {
  const tags = [
    {key: 'station_id', value: []},
    {key: 'station_owner', value: ['COMPS']},
  ]

  let list: JSX.Element | JSX.Element[] = (
    <div className="tag-keys-selector--list-item">No Tags Found</div>
  )

  if (tags.length) {
    list = tags.map(tag => (
      <div key={tag.key} className="tag-keys-selector--list-item">
        {tag.key}
      </div>
    ))
    list.push(
      <div key="load-more" className="tag-keys-selector--list-item">
        Load More
      </div>
    )
  }
  return (
    <Accordion className="tag-keys-selector">
      <Accordion.AccordionHeader className="tag-keys-selector--header">
        <SelectorTitle title="Tag Keys" />
      </Accordion.AccordionHeader>
      {list}
    </Accordion>
  )
}

export default TagKeysSelector
