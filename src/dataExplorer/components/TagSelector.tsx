import React, {FC} from 'react'

// Components
import {Accordion} from '@influxdata/clockface'
import SelectorTitle from 'src/dataExplorer/components/SelectorTitle'

interface Tag {
  key: string
  values: string[]
}
interface Prop {
  tag: Tag
  onSelect: (value: string) => void
}

const TagValues: FC<Prop> = ({tag, onSelect}) => {
  return (
    <Accordion className="tag-value-selector">
      <Accordion.AccordionHeader className="tag-value-selector--header">
        <SelectorTitle title={tag.key} />
      </Accordion.AccordionHeader>
      <div>
        {tag.values.map(value => (
          <div key={value} onClick={() => onSelect(value)}>
            {value}
          </div>
        ))}
      </div>
    </Accordion>
  )
}

const TagSelector: FC = () => {
  const tags = [
    {key: 'station_id', values: ['Everglades National Park']},
    {key: 'station_owner', values: ['COMPS', 'Chicago Park District']},
  ]

  const handleSelect = (value: string) => {
    // TODO
    /* eslint-disable no-console */
    console.log(value)
    /* eslint-disable no-console */
  }

  let list: JSX.Element | JSX.Element[] = (
    <div className="tag-selector--list-item">No Tags Found</div>
  )

  if (tags.length) {
    list = tags.map(tag => (
      <div key={tag.key} className="tag-selector--list-item">
        <TagValues tag={tag} onSelect={handleSelect} />
      </div>
    ))
    // TODO: check length of tags to load more
    // list.push(
    //   <div key="load-more" className="tag-selector--list-item">
    //     Load More
    //   </div>
    // )
  }
  return (
    <Accordion className="tag-selector" expanded={true}>
      <Accordion.AccordionHeader className="tag-selector--header">
        <SelectorTitle title="Tag Keys" info="Test info" />
      </Accordion.AccordionHeader>
      {list}
    </Accordion>
  )
}

export default TagSelector
