import React, {FC, useContext} from 'react'

// Components
import {Accordion} from '@influxdata/clockface'
import SelectorTitle from 'src/dataExplorer/components/SelectorTitle'

// Contexts
import {
  NewDataExplorerContext,
  Tag,
} from 'src/dataExplorer/context/newDataExplorer'

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
      <div className="container-side-bar">
        {tag.values.map(value => (
          <div
            className="tag-value-selector--list-item"
            key={value}
            onClick={() => onSelect(value)}
          >
            {value}
          </div>
        ))}
      </div>
    </Accordion>
  )
}

const TagSelector: FC = () => {
  const {tags} = useContext(NewDataExplorerContext)

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
      <div className="container-side-bar">{list}</div>
    </Accordion>
  )
}

export default TagSelector
